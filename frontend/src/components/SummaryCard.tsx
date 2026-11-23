interface SummaryCardProps {
    label: string;
    value: string | number;
    description: string;
    valueColor?: string;
    className?: string;
}

function SummaryCard({
    label,
    value,
    description,
    valueColor = 'text-gray-900 dark:text-white',
    className = ''
}: SummaryCardProps) {
    return (
        <div className={`rounded-2xl p-5 sm:p-6  shadow dark:border dark:border-gray-800 bg-[#99alaf] dark:bg-[#] ${className}`}>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {label}
            </p>

            <h2 className={`mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold ${valueColor}`}>
                {value}
            </h2>

            <p className="mt-1.5 sm:mt-2 text-xs text-gray-400 dark:text-gray-500">
                {description}
            </p>
        </div>
    );
}

export default SummaryCard;