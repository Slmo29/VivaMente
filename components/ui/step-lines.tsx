import { COLORS } from "@/lib/design-tokens";

interface StepLinesProps {
  current: number;
  total?: number;
}

export default function StepLines({ current, total = 5 }: StepLinesProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex gap-1.5" style={{ width: 120 }}>
        {Array.from({ length: total }).map((_, i) => {
          const isActive    = i === current;
          const isCompleted = i < current;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 9999,
                backgroundColor: isActive || isCompleted ? COLORS.primary : "#D1D5DB",
                opacity: isCompleted ? 0.4 : 1,
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
