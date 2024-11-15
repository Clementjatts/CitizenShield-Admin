import React from 'react';
import { Heart, Stethoscope, Droplet, Flame, Bone, AlertTriangle } from 'lucide-react';

const FirstAidTips: React.FC = () => {
  const firstAidTips = [
    {
      title: 'CPR (Cardiopulmonary Resuscitation)',
      icon: <Heart size={32} />,
      color: 'bg-red-500',
      steps: [
        'Check the scene for safety',
        'Check for responsiveness',
        'Call for help or ask someone to call 911',
        'Open the airway',
        'Check for breathing',
        'Begin chest compressions',
        'Provide rescue breaths',
        'Continue CPR until help arrives'
      ]
    },
    {
      title: 'Choking',
      icon: <Stethoscope size={32} />,
      color: 'bg-yellow-500',
      steps: [
        'Encourage coughing',
        'Perform back blows',
        'Perform abdominal thrusts (Heimlich maneuver)',
        'Alternate between back blows and abdominal thrusts',
        'Perform CPR if the person becomes unconscious'
      ]
    },
    {
      title: 'Severe Bleeding',
      icon: <Droplet size={32} />,
      color: 'bg-red-600',
      steps: [
        'Apply direct pressure with a clean cloth',
        'Elevate the injured area above the heart if possible',
        'Apply a tourniquet as a last resort for life-threatening limb bleeding',
        'Seek immediate medical attention'
      ]
    },
    {
      title: 'Burns',
      icon: <Flame size={32} />,
      color: 'bg-orange-500',
      steps: [
        'Remove the source of the burn',
        'Cool the burn with cool (not cold) running water for at least 10 minutes',
        'Cover the burn with a sterile, non-stick bandage',
        'Do not apply butter, oil, or ice to the burn',
        'Seek medical attention for severe burns'
      ]
    },
    {
      title: 'Fractures',
      icon: <Bone size={32} />,
      color: 'bg-blue-500',
      steps: [
        'Do not move the injured person unless absolutely necessary',
        'Stop any bleeding',
        'Immobilize the injured area',
        'Apply cold packs to reduce swelling',
        'Seek medical attention'
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-400 to-indigo-300 min-h-screen p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-10 text-white flex items-center justify-center">
          <Stethoscope size={40} className="mr-4" />
          First Aid Tips
        </h2>
        <p className="text-center text-lg sm:text-xl lg:text-2xl mb-10 sm:mb-16 text-white max-w-4xl mx-auto">
          Essential first aid techniques to help you respond effectively in emergency situations.
          Remember, these tips are not a substitute for professional medical training.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
          {firstAidTips.map((tip, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`${tip.color} text-white p-4 sm:p-6 flex items-center`}>
                {tip.icon}
                <h3 className="text-xl sm:text-2xl font-bold ml-4">{tip.title}</h3>
              </div>
              <ul className="p-4 sm:p-6 space-y-3">
                {tip.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start text-base sm:text-lg">
                    <span className={`${tip.color} text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 font-bold`}>
                      {stepIndex + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-500 mr-3" />
            <h4 className="text-xl sm:text-2xl font-bold text-red-600">Important Note</h4>
          </div>
          <p className="text-center text-base sm:text-lg text-gray-700">
            Always call emergency services (911) for serious medical emergencies.
            These tips are for informational purposes only and should not replace professional medical advice or training.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstAidTips;