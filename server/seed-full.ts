import { storage } from "./storage";
import type { InsertQuestion } from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

interface RawQuestion {
  id: string;
  correct: number;
  refs: string;
  question: string;
  answers: string[];
}

// Detailed explanations for all Technician questions
// This is a mapping of question IDs to explanations
const explanations: Record<string, string> = {
  // In a production app, these would all be filled in
  // For now, we'll generate a basic explanation based on the correct answer
};

function generateExplanation(question: RawQuestion): string {
  const correctAnswerLetter = String.fromCharCode(65 + question.correct); // 0->A, 1->B, etc.
  const correctAnswerText = question.answers[question.correct];
  
  // Check if we have a custom explanation
  if (explanations[question.id]) {
    return explanations[question.id];
  }
  
  // Generate a basic explanation
  return `The correct answer is ${correctAnswerLetter}: "${correctAnswerText}". This question tests your knowledge of ${getTopicName(question.id)}. Understanding this concept is important for passing the Technician exam and operating your amateur radio station safely and effectively.`;
}

function getTopicName(questionId: string): string {
  const subelement = questionId.substring(0, 3);
  const topics: Record<string, string> = {
    'T1A': 'FCC Rules and Regulations',
    'T1B': 'Station Control and Frequency Authorization',
    'T1C': 'Amateur Radio Licensing',
    'T1D': 'Authorized and Prohibited Transmissions',
    'T1E': 'Control Operator and Control Types',
    'T1F': 'Station Identification',
    'T2A': 'VHF/UHF Operating Practices',
    'T2B': 'Repeater Operating Procedures',
    'T2C': 'Emergency and Public Service Communications',
    'T3A': 'Radio Wave Propagation',
    'T3B': 'Radio and Electromagnetic Wave Properties',
    'T3C': 'Satellite and Space Communications',
    'T4A': 'Station Setup and Operation',
    'T4B': 'Telephones, Computer and Mobile Devices',
    'T5A': 'Electrical Principles and Units',
    'T5B': 'Math for Electronics',
    'T5C': 'Electronic Principles',
    'T5D': "Ohm's Law and Power",
    'T6A': 'Electrical Components',
    'T6B': 'Semiconductors',
    'T6C': 'Circuit Diagrams and Schematic Symbols',
    'T6D': 'Component Functions',
    'T7A': 'Receiver Fundamentals',
    'T7B': 'Transmitter and Transceiver Operation',
    'T7C': 'Test Equipment and Measurements',
    'T7D': 'Meters and Radio Direction Finding',
    'T8A': 'Modulation Modes',
    'T8B': 'Amateur Satellite Service',
    'T8C': 'Operating Activities and Procedures',
    'T8D': 'Non-Voice Communications',
    'T9A': 'Antenna Basics',
    'T9B': 'Feed Lines and SWR',
    'T0A': 'Electrical Safety',
    'T0B': 'Antenna and Tower Safety',
    'T0C': 'RF Exposure and Environmental Safety',
  };
  
  return topics[subelement] || 'amateur radio operations';
}

export async function seedFullQuestions() {
  console.log("Loading complete Technician question pool...");
  
  try {
    // Read the JSON file
    const jsonPath = '/tmp/technician_questions.json';
    const rawData = readFileSync(jsonPath, 'utf8');
    const rawQuestions: RawQuestion[] = JSON.parse(rawData);
    
    console.log(`Found ${rawQuestions.length} questions in the pool`);
    
    // Transform to our schema format
    const questions: InsertQuestion[] = rawQuestions.map((q) => {
      const correctAnswerIndex = q.correct;
      const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex); // 0->A, 1->B, etc.
      
      // Extract subelement from question ID (e.g., "T1A01" -> "T1A")
      const subelement = q.id.substring(0, 3);
      
      // Clean up references - remove brackets if present
      const references = q.refs ? q.refs.replace(/[\[\]]/g, '') : null;
      
      return {
        id: q.id,
        subelement,
        questionText: q.question,
        answerA: q.answers[0] || '',
        answerB: q.answers[1] || '',
        answerC: q.answers[2] || '',
        answerD: q.answers[3] || '',
        correctAnswer: correctAnswerLetter,
        explanation: generateExplanation(q),
        references,
      };
    });
    
    // Seed the questions
    console.log(`Seeding ${questions.length} questions to database...`);
    await storage.seedQuestions(questions);
    
    console.log("✓ Successfully seeded all Technician questions!");
    console.log("\nQuestion pool summary:");
    console.log("- Source: NCVEC 2022-2026 Technician Question Pool");
    console.log("- Total questions:", questions.length);
    console.log("- Valid from: July 1, 2022 to June 30, 2026");
    
    // Count questions by subelement
    const subelementCounts: Record<string, number> = {};
    questions.forEach(q => {
      const prefix = q.subelement.substring(0, 2); // T1, T2, etc.
      subelementCounts[prefix] = (subelementCounts[prefix] || 0) + 1;
    });
    
    console.log("\nQuestions by subelement:");
    Object.entries(subelementCounts).sort().forEach(([sub, count]) => {
      console.log(`  ${sub}: ${count} questions`);
    });
    
  } catch (error) {
    console.error("Error seeding questions:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFullQuestions()
    .then(() => {
      console.log("\n✓ Database seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n✗ Seeding failed:", error);
      process.exit(1);
    });
}
