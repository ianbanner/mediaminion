
import React, { useState, useMemo } from 'react';

const SliderInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  prefix?: string;
}> = ({ label, value, min, max, step, onChange, unit = '', prefix = '' }) => (
  <div className="space-y-2">
    <label className="flex justify-between items-center text-gray-300 text-sm sm:text-base">
      <span>{label}</span>
      <span className="font-bold text-teal-300 text-lg">{prefix}{value.toLocaleString()}{unit}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
    />
  </div>
);

const SavingsCalculator: React.FC = () => {
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [timePerPost, setTimePerPost] = useState(30); // in minutes
  const [articlesPerWeek, setArticlesPerWeek] = useState(1);
  const [timePerArticle, setTimePerArticle] = useState(4); // in hours
  const [hourlyRate, setHourlyRate] = useState(150);

  const { weeklyTimeSaved, yearlyMoneySaved } = useMemo(() => {
    const WEEKS_IN_MONTH = 4.33;
    const MONTHS_IN_YEAR = 12;

    const totalPostMinutesPerWeek = postsPerWeek * timePerPost;
    const totalArticleMinutesPerWeek = articlesPerWeek * timePerArticle * 60;
    const totalCurrentMinutesPerWeek = totalPostMinutesPerWeek + totalArticleMinutesPerWeek;
    
    // "What took an hour now takes 10 minutes" -> 1/6th of the time
    const timeWithMinionPerWeek = totalCurrentMinutesPerWeek / 6;
    const minutesSavedPerWeek = totalCurrentMinutesPerWeek - timeWithMinionPerWeek;
    
    const hoursSavedPerWeek = minutesSavedPerWeek / 60;
    
    const hoursSavedPerMonth = hoursSavedPerWeek * WEEKS_IN_MONTH;
    const costSavedPerMonth = hoursSavedPerMonth * hourlyRate;
    const costSavedPerYear = costSavedPerMonth * MONTHS_IN_YEAR;

    return { 
        weeklyTimeSaved: hoursSavedPerWeek.toFixed(1), 
        yearlyMoneySaved: costSavedPerYear.toLocaleString('en-US', { maximumFractionDigits: 0 }) 
    };
  }, [postsPerWeek, timePerPost, articlesPerWeek, timePerArticle, hourlyRate]);

  const { recommendedTimeSaved, recommendedMoneySaved } = useMemo(() => {
    const WEEKS_IN_MONTH = 4.33;
    const RECOMMENDED_POSTS_PER_WEEK = 7;
    const RECOMMENDED_ARTICLES_PER_WEEK = 2;

    const avgTimePerPost = 30; // Use a fixed average for recommendation
    const avgTimePerArticle = 4; // Use a fixed average for recommendation

    const totalPostMinutes = RECOMMENDED_POSTS_PER_WEEK * avgTimePerPost;
    const totalArticleMinutes = RECOMMENDED_ARTICLES_PER_WEEK * avgTimePerArticle * 60;
    const totalCurrentMinutes = totalPostMinutes + totalArticleMinutes;
    
    const timeWithMinion = totalCurrentMinutes / 6;
    const minutesSaved = totalCurrentMinutes - timeWithMinion;
    
    const hoursSaved = (minutesSaved / 60) * WEEKS_IN_MONTH;
    const costSaved = hoursSaved * hourlyRate; // Use the user's hourly rate for personalization

    return { 
        recommendedTimeSaved: hoursSaved.toFixed(1), 
        recommendedMoneySaved: costSaved.toLocaleString('en-US', { maximumFractionDigits: 0 }) 
    };
  }, [hourlyRate]);

  return (
    <div className="p-6 sm:p-8 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SliderInput 
            label="Posts per week"
            value={postsPerWeek}
            min={0} max={21} step={1}
            onChange={setPostsPerWeek}
          />
           <div>
              <label className="block text-gray-300 mb-2 text-sm sm:text-base">Time to write per post (minutes)</label>
              <div className="flex gap-2">
                {[15, 30, 60].map(time => (
                  <button
                    key={time}
                    onClick={() => setTimePerPost(time)}
                    className={`px-3 py-2 text-sm sm:text-base rounded-md font-semibold w-full transition-colors ${timePerPost === time ? 'bg-teal-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
           <SliderInput 
            label="Articles per week"
            value={articlesPerWeek}
            min={0} max={5} step={1}
            onChange={setArticlesPerWeek}
          />
           <div>
              <label className="block text-gray-300 mb-2 text-sm sm:text-base">Time to write per article (hours)</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map(time => (
                  <button
                    key={time}
                    onClick={() => setTimePerArticle(time)}
                    className={`px-3 py-2 text-sm sm:text-base rounded-md font-semibold w-full transition-colors ${timePerArticle === time ? 'bg-teal-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          <SliderInput 
            label="Your hourly rate (for illustrative purposes)"
            value={hourlyRate}
            min={25} max={500} step={5}
            onChange={setHourlyRate}
            prefix="$"
          />
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 lg:border-l lg:border-slate-700 lg:pl-8">
             <div className="p-6 bg-indigo-900 rounded-lg text-center w-full">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Weekly Time Saved</p>
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400 my-2">
                    {weeklyTimeSaved}
                </p>
                <p className="text-gray-500">hours</p>
                <p className="text-gray-300 text-sm mt-3 italic">What will you do with all that extra time?</p>
            </div>
             <div className="p-6 bg-indigo-900 rounded-lg text-center w-full">
                <p className="text-gray-400 text-sm uppercase tracking-wider">Yearly Money Saved</p>
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400 my-2">
                    ${yearlyMoneySaved}
                </p>
                <p className="text-gray-500">based on your rate</p>
                <p className="text-gray-300 text-sm mt-3 italic">What will you do with all that extra money?</p>
            </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-700 text-center space-y-3">
        <p className="text-gray-300 text-base sm:text-lg">
          Posting once a day and writing two articles per week is recommended. Using Social Media Minion, you could save <span className="font-bold text-white">{recommendedTimeSaved} hours</span> and <span className="font-bold text-white">${recommendedMoneySaved}</span> every month.
        </p>
        <p className="text-gray-400 text-sm">
          ...and that's not even counting the 30% increase in follower traction we've seen reported.
        </p>
      </div>
    </div>
  );
};

export default SavingsCalculator;