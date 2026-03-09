interface NutriscoreBadgeProps {
  nutriscore: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function NutriscoreBadge({ 
  nutriscore, 
  size = 'sm', 
  showLabel = true 
}: NutriscoreBadgeProps) {
  if (!nutriscore) return null;

  const score = nutriscore.toUpperCase();
  const validScores = ['A', 'B', 'C', 'D', 'E'];
  
  if (!validScores.includes(score)) return null;

  const colors = {
    A: 'bg-green-500 border-green-600',
    B: 'bg-lime-500 border-lime-600', 
    C: 'bg-yellow-500 border-yellow-600',
    D: 'bg-orange-500 border-orange-600',
    E: 'bg-red-500 border-red-600'
  };

  const textColors = {
    A: 'text-white',
    B: 'text-white',
    C: 'text-black',
    D: 'text-white',
    E: 'text-white'
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs font-bold',
    md: 'w-8 h-8 text-sm font-bold',
    lg: 'w-10 h-10 text-base font-bold'
  };

  const labelSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div className="flex items-center gap-1.5">
      <div 
        className={`
          ${colors[score as keyof typeof colors]} 
          ${textColors[score as keyof typeof textColors]} 
          ${sizeClasses[size]}
          border-2 rounded flex items-center justify-center
          shadow-sm
        `}
        title={`Nutri-Score ${score}`}
      >
        {score}
      </div>
      {showLabel && (
        <span className={`${labelSizeClasses[size]} font-medium text-zinc-400`}>
          Nutri-Score {score}
        </span>
      )}
    </div>
  );
}
