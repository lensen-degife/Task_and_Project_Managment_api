import {Star} from 'lucide-react'

export function BrandingPanel () {
    return (

        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#071030] text-[#f4f2f2] p-6 sm:p-8 lg:p-10 flex flex-col justify-between min-h-80 sm:min-h-100">

            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-50 pointer-events-none"
                style={{
                    backgroundImage: `
                linear-gradient(to right, #444 1px, transparent 1px),
                linear-gradient(to bottom, #444 1px, transparent 1px)
              `,
                    backgroundSize: '32px 32px'
                }}
            />

            <div className="relative z-10">
                <div className="text-lg sm:text-xl font-semibold tracking-wide flex items-center gap-1.5">
                    <span className="text-[#637ef6]">◀|</span> <p className="font-semibold p-0 text-[#c2c6dc]"> PlanWithMe</p>
                </div>

                <div className="mt-8 sm:mt-12 lg:mt-16 max-w-lg">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                        The Ultimate Project Management Solution
                    </h1>

                    <p className="mt-3 sm:mt-6 text-gray-400 text-xs sm:text-sm lg:text-base leading-relaxed">
                        Stay organized, meet deadlines, and collaborate seamlessly
                        —all in one place.
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-8 sm:mt-12 lg:mt-16">
                <div className="flex space-x-2">
                    <div className="flex -space-x-2.5 sm:-space-x-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-400 border-2 border-gray-900" />
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-400 border-2 border-gray-900" />
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-400 border-2 border-gray-900" />
                    </div>

                    <div className="flex flex-col gap-1 ">
                        <div className="relative pt-2 inline-flex ">
                            <div className="flex gap-1  text-gray-500 justify-center">
                                {Array.from({ length: 5 }, (_, index) => (
                                    <Star
                                        key={index}
                                        size={20}
                                        fill="currentColor"
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>

                            <div className="absolute  left-0 flex gap-1 overflow-hidden text-[#ebd059]"
                                style={{ width: '90%' }}>
                                {Array.from({ length: 5 }, (_, index) => (
                                    <Star
                                        key={index}
                                        size={20}
                                        fill="currentColor"
                                        strokeWidth={0}
                                        className="shrink-0"
                                    />
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

                <p className="text-xs sm:text-sm font-medium text-[#f4f2f2]">
                    Join 1K+ Teams Powering Their Success with PlanWithMe
                </p>

                <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                    <li>✓ Plan, track, and deliver projects efficiently.</li>
                    <li>✓ Customizable workflows for every team.</li>
                    <li>✓ Integrates seamlessly with your favorite tools.</li>
                </ul>
            </div>
        </div>
    );
}
