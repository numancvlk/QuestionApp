interface MotivationMessage {
  [languageId: string]: {
    [context: string]: string[];
  };
}

const allMotivationMessages: MotivationMessage = {
  "tr-TR": {
    quiz_end: [
      "Harika bir iş çıkardın! Her doğru cevap, seni hedeflerine bir adım daha yaklaştırıyor.",
      "Gelişimini görmek harika! Azimle devam et, başarı kaçınılmaz.",
      "Tebrikler! Bilgin her quizde daha da pekişiyor. Durmak yok!",
      "Her deneme bir öğrenme fırsatıdır. Bugün de çok şey öğrendin!",
      "Başardın! Bu puanlar senin emeğinin karşılığı. Yeni zirvelere doğru ilerle!",
      "Çok iyi! Pratik yaptıkça mükemmelleşeceksin.",
      "Dil öğrenme yolculuğunda bir adım daha! Tebrikler.",
      "Motivasyonun tam gaz! Devam et, öğrenmenin sonu yok.",
      "Bugün de kendini aştın! Yarın daha da iyi olacaksın.",
      "Her soru bir tuğla, bilginin duvarını örüyorsun. Sağlam adımlarla ilerle!",
    ],
    daily_challenge: [],
  },
  "en-US": {
    quiz_end: [
      "Great job! Every correct answer brings you closer to your goals.",
      "It's wonderful to see your progress! Keep going with determination, success is inevitable.",
      "Congratulations! Your knowledge is strengthening with each quiz. Don't stop now!",
      "Every attempt is a learning opportunity. You learned so much today!",
      "You did it! These points are the reward for your hard work. Strive for new heights!",
      "Excellent! You'll perfect it with practice.",
      "Another step forward in your language learning journey! Congratulations.",
      "Your motivation is full throttle! Keep going, there's no end to learning.",
      "You outdid yourself today! You'll be even better tomorrow.",
      "Each question is a brick; you're building your wall of knowledge. Progress with steady steps!",
    ],
  },
};

function pickRandomMessage(messages: string[]): string {
  if (!messages || messages.length === 0) {
    return "Harika iş! Öğrenmeye devam et.";
  }
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

export const getRandomMotivationMessage = (
  languageId: string,
  context: string
): string => {
  const langMessages = allMotivationMessages[languageId];
  if (langMessages && langMessages[context]) {
    return pickRandomMessage(langMessages[context]);
  }
  console.warn(
    `[Motivation] No messages found for languageId: ${languageId}, context: ${context}. Using fallback.`
  );
  return pickRandomMessage(allMotivationMessages["tr-TR"]["quiz_end"]);
};
