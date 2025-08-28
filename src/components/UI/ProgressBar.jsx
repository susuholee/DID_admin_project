'use client';

export default function ProgressBar({ 
  currentStep, 
  totalSteps, 
  className = "",
  barColor = "rose-400",
  bgColor = "gray-200",
  showPercentage = true,
  showStepText = true
}) {
  // 진행률 계산 (0-100%)
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  // 진행률이 100%를 초과하지 않도록 제한
  const clampedProgress = Math.min(progress, 100);

  return (
    <div className={`mb-6 ${className}`}>
      {/* 상단 정보 표시 */}
      {(showStepText || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showStepText && (
            <span className="text-sm text-gray-600">
              단계 {currentStep} / {totalSteps}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      
      {/* 진행률 바 */}
      <div className={`w-full bg-${bgColor} rounded-full h-2`}>
        <div 
          className={`bg-${barColor} h-2 rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`진행률: ${clampedProgress}%, ${currentStep}단계 중 ${totalSteps}단계`}
        />
      </div>
    </div>
  );
}