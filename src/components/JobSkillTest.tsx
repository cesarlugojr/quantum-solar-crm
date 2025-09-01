/**
 * Job-Specific Skill Testing Component
 * 
 * Provides interactive assessments for different job positions:
 * - Solar Installer: Technical knowledge and safety protocols
 * - Licensed Electrician: Advanced electrical systems and code compliance
 * 
 * Features:
 * - Position-specific questions
 * - Scoring system with pass/fail thresholds
 * - Results integration with job application
 * - Progress tracking and time limits
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { XCircle, Clock, AlertCircle, Trophy } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface JobSkillTestProps {
  jobId: string;
  onTestComplete: (results: TestResults) => void;
  onBack: () => void;
}

interface TestResults {
  score: number;
  totalQuestions: number;
  percentageScore: number;
  passed: boolean;
  timeSpent: number;
  answers: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

interface UserAnswer {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
  timeTaken: number;
}

const solarInstallerQuestions: Question[] = [
  {
    id: 1,
    question: "What is the standard voltage output for most residential solar panels?",
    options: ["12V DC", "24V DC", "30-40V DC", "120V AC"],
    correctAnswer: 2,
    explanation: "Most residential solar panels output between 30-40V DC under standard test conditions.",
    difficulty: "easy"
  },
  {
    id: 2,
    question: "What safety equipment is absolutely required when working on rooftops?",
    options: ["Safety glasses only", "Hard hat and gloves", "Fall protection harness and hard hat", "Steel-toed boots"],
    correctAnswer: 2,
    explanation: "Fall protection equipment is essential for roof work, along with hard hats for head protection.",
    difficulty: "easy"
  },
  {
    id: 3,
    question: "What is the recommended minimum distance between solar panels and roof edges?",
    options: ["6 inches", "1 foot", "3 feet", "5 feet"],
    correctAnswer: 2,
    explanation: "Most jurisdictions require at least 3 feet of clearance from roof edges for fire safety access.",
    difficulty: "medium"
  },
  {
    id: 4,
    question: "Which component converts DC electricity from panels to AC electricity for home use?",
    options: ["Charge controller", "Battery", "Inverter", "Combiner box"],
    correctAnswer: 2,
    explanation: "Inverters convert the DC electricity from solar panels to AC electricity used in homes.",
    difficulty: "easy"
  },
  {
    id: 5,
    question: "What is the ideal roof orientation and tilt angle for maximum solar production in Illinois?",
    options: ["North-facing at 45°", "South-facing at 30-40°", "East-facing at 20°", "West-facing at 50°"],
    correctAnswer: 1,
    explanation: "South-facing roofs at 30-40° tilt provide optimal solar irradiance in Illinois latitude.",
    difficulty: "medium"
  },
  {
    id: 6,
    question: "What should you do if you encounter asbestos shingles during installation?",
    options: ["Continue carefully", "Remove them yourself", "Stop work and contact supervisor", "Spray with water and continue"],
    correctAnswer: 2,
    explanation: "Asbestos requires special handling by certified professionals. Work must stop immediately.",
    difficulty: "hard"
  },
  {
    id: 7,
    question: "Which grounding method is required for solar panel installations?",
    options: ["Equipment grounding only", "System grounding only", "Both equipment and system grounding", "No grounding required"],
    correctAnswer: 2,
    explanation: "Both equipment grounding (safety) and system grounding (functionality) are required by NEC.",
    difficulty: "hard"
  },
  {
    id: 8,
    question: "What is the maximum number of panels typically connected in series for a residential string?",
    options: ["5-8 panels", "10-12 panels", "15-20 panels", "25-30 panels"],
    correctAnswer: 1,
    explanation: "Residential strings typically have 10-12 panels to stay within voltage limits of residential inverters.",
    difficulty: "medium"
  }
];

const electricianQuestions: Question[] = [
  {
    id: 1,
    question: "What is the maximum voltage allowed for residential solar DC systems under NEC 690?",
    options: ["600V", "1000V", "1500V", "2000V"],
    correctAnswer: 0,
    explanation: "NEC Article 690 limits residential solar DC systems to 600V for safety.",
    difficulty: "medium"
  },
  {
    id: 2,
    question: "Which NEC article specifically covers solar photovoltaic systems?",
    options: ["Article 680", "Article 690", "Article 700", "Article 705"],
    correctAnswer: 1,
    explanation: "NEC Article 690 specifically addresses solar photovoltaic systems requirements.",
    difficulty: "easy"
  },
  {
    id: 3,
    question: "What is the required amperage rating for a solar AC disconnect?",
    options: ["Equal to maximum current", "125% of maximum current", "150% of maximum current", "200% of maximum current"],
    correctAnswer: 1,
    explanation: "Disconnects must be rated at least 125% of the maximum current per NEC requirements.",
    difficulty: "hard"
  },
  {
    id: 4,
    question: "Where must the rapid shutdown device be located for rooftop solar systems?",
    options: ["At the inverter", "At the main panel", "Within 10 feet of the array", "At each panel"],
    correctAnswer: 2,
    explanation: "NEC 690.12 requires rapid shutdown initiation within 10 feet of the PV array.",
    difficulty: "hard"
  },
  {
    id: 5,
    question: "What is the minimum wire size for solar equipment grounding conductors?",
    options: ["14 AWG", "12 AWG", "10 AWG", "8 AWG"],
    correctAnswer: 1,
    explanation: "Equipment grounding conductors must be minimum 12 AWG copper per NEC 690.43.",
    difficulty: "medium"
  },
  {
    id: 6,
    question: "Which type of conduit is preferred for DC solar wiring runs?",
    options: ["PVC", "EMT", "Flexible conduit", "MC cable"],
    correctAnswer: 1,
    explanation: "EMT (Electrical Metallic Tubing) is preferred for DC runs due to durability and code compliance.",
    difficulty: "medium"
  },
  {
    id: 7,
    question: "What is the maximum allowed temperature rise for solar DC circuits?",
    options: ["30°C", "40°C", "50°C", "60°C"],
    correctAnswer: 0,
    explanation: "DC circuits must be derated for temperatures above 30°C (86°F) ambient.",
    difficulty: "hard"
  },
  {
    id: 8,
    question: "How should solar DC circuits be identified and labeled?",
    options: ["Red tape only", "Warning labels only", "Source circuit identification", "All of the above"],
    correctAnswer: 3,
    explanation: "All solar DC circuits require proper identification, labeling, and source circuit marking.",
    difficulty: "medium"
  },
  {
    id: 9,
    question: "What is the required clearance around solar panels for fire access?",
    options: ["1 foot", "2 feet", "3 feet", "Varies by jurisdiction"],
    correctAnswer: 3,
    explanation: "Fire access clearances vary by local jurisdiction but typically range from 3-8 feet.",
    difficulty: "easy"
  },
  {
    id: 10,
    question: "Which protection is required for solar DC combiner boxes?",
    options: ["Overcurrent protection only", "Arc fault protection only", "Both overcurrent and arc fault", "Neither is required"],
    correctAnswer: 2,
    explanation: "Modern installations require both overcurrent protection and arc fault circuit interruption.",
    difficulty: "hard"
  }
];

export function JobSkillTest({ jobId, onTestComplete, onBack }: JobSkillTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  const questions = jobId === 'licensed-electrician' ? electricianQuestions : solarInstallerQuestions;
  const passingScore = jobId === 'licensed-electrician' ? 70 : 60; // Higher threshold for electrician

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const timeTaken = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;

    const answer: UserAnswer = {
      questionId: questions[currentQuestion].id,
      selectedAnswer,
      correct: isCorrect,
      timeTaken
    };

    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (!isCorrect) {
      setShowExplanation(true);
      return;
    }

    proceedToNext(newAnswers);
  };

  const proceedToNext = (answers: UserAnswer[]) => {
    setSelectedAnswer(null);
    setShowExplanation(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeTest(answers);
    }
  };

  const completeTest = (answers: UserAnswer[]) => {
    const correctAnswers = answers.filter(a => a.correct).length;
    const totalQuestions = questions.length;
    const percentageScore = Math.round((correctAnswers / totalQuestions) * 100);
    const timeSpent = Math.round((Date.now() - testStartTime) / 1000 / 60); // Minutes
    const passed = percentageScore >= passingScore;

    // Transform UserAnswer[] to the expected format
    const transformedAnswers = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return {
        question: question?.question || '',
        userAnswer: question?.options[answer.selectedAnswer] || '',
        correctAnswer: question?.options[question.correctAnswer] || '',
        isCorrect: answer.correct
      };
    });

    const results: TestResults = {
      score: correctAnswers,
      totalQuestions,
      percentageScore,
      passed,
      timeSpent,
      answers: transformedAnswers
    };

    setTestResults(results);
    setTestCompleted(true);
    onTestComplete(results);
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (testCompleted && testResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="mb-4">
                {testResults.passed ? (
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                )}
              </div>
              <CardTitle className="text-3xl text-white mb-2">
                Test {testResults.passed ? 'Completed!' : 'Results'}
              </CardTitle>
              <div className="text-6xl font-bold mb-4">
                <span className={testResults.passed ? 'text-green-400' : 'text-red-400'}>
                  {testResults.percentageScore}%
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{testResults.score}/{testResults.totalQuestions}</div>
                  <div className="text-gray-400">Correct Answers</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{testResults.timeSpent}</div>
                  <div className="text-gray-400">Minutes</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <Badge className={testResults.passed ? 'bg-green-600' : 'bg-red-600'}>
                    {testResults.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                  </Badge>
                </div>
              </div>

              <div className="text-center space-y-4">
                {testResults.passed ? (
                  <div className="text-green-400">
                    <p className="text-lg mb-2">Congratulations! You&apos;ve demonstrated the technical knowledge needed for this position.</p>
                    <p className="text-gray-300">You may now proceed with your job application.</p>
                  </div>
                ) : (
                  <div className="text-red-400">
                    <p className="text-lg mb-2">You scored below the required {passingScore}% threshold.</p>
                    <p className="text-gray-300">We encourage you to study the areas covered and retake the test in 24 hours.</p>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <Button 
                    onClick={onBack}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Back to Job Posting
                  </Button>
                  {testResults.passed && (
                    <Button 
                      onClick={() => onTestComplete(testResults)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continue Application
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {jobId === 'licensed-electrician' ? 'Licensed Electrician' : 'Solar Installer'} Skills Assessment
          </h1>
          <p className="text-gray-300 mb-4">
            Question {currentQuestion + 1} of {questions.length} • Passing Score: {passingScore}%
          </p>
          <div className="max-w-md mx-auto">
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge className={`${getDifficultyColor(questions[currentQuestion].difficulty)} text-white`}>
                {questions[currentQuestion].difficulty.toUpperCase()}
              </Badge>
              <div className="flex items-center text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                <span>No time limit per question</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-white leading-relaxed">
              {questions[currentQuestion].question}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-600 bg-slate-700/30 text-white hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 font-semibold mb-2">Incorrect Answer</p>
                    <p className="text-gray-300">{questions[currentQuestion].explanation}</p>
                    <p className="text-gray-400 mt-2 text-sm">
                      Correct answer: {String.fromCharCode(65 + questions[currentQuestion].correctAnswer)} - {questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button 
                onClick={onBack}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Exit Test
              </Button>
              
              <Button 
                onClick={showExplanation ? () => proceedToNext(userAnswers) : handleNextQuestion}
                disabled={selectedAnswer === null}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {showExplanation ? 'Continue' : (currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next Question')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
