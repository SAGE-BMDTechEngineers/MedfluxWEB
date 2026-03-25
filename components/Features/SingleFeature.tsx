import { Feature } from "@/types/feature";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph } = feature;

  return (
    <div className="group w-full">
      {/* Main Card Container with Modern Design */}
      <div className="relative w-full h-full p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 
                      backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50
                      shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10
                      transform hover:-translate-y-2 transition-all duration-500 ease-out
                      before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br 
                      before:from-indigo-50/50 before:to-purple-50/30 dark:before:from-indigo-900/20 
                      dark:before:to-purple-900/10 before:opacity-0 before:transition-opacity 
                      before:duration-500 hover:before:opacity-100">
        
        {/* Animated Background Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 
                        rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000 
                        group-hover:duration-200 animate-pulse"></div>
        
        {/* Content Container */}
        <div className="relative flex items-start space-x-5">
          {/* Icon Container with Advanced Animations */}
          <div className="flex-shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center rounded-xl 
                          bg-gradient-to-br from-indigo-500 to-purple-600 text-white
                          shadow-lg group-hover:shadow-xl group-hover:shadow-indigo-500/25
                          transform group-hover:scale-110 group-hover:rotate-3
                          transition-all duration-500 ease-out">
              
              {/* Icon with Multiple Animations */}
              <div className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-300
                            group-hover:animate-pulse">
                {icon}
              </div>
              
              {/* Floating Particles Effect */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full 
                            opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100
                            transition-all duration-700 delay-200 animate-ping"></div>
              
              {/* Ripple Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-indigo-400/30 
                            scale-100 group-hover:scale-150 opacity-100 group-hover:opacity-0
                            transition-all duration-700"></div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Title with Gradient and Animation */}
            <h3 className="mb-4 text-xl font-bold sm:text-2xl lg:text-xl xl:text-2xl
                         bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200
                         bg-clip-text text-transparent
                         group-hover:from-indigo-600 group-hover:to-purple-600
                         transition-all duration-500 ease-out
                         transform group-hover:translate-x-1">
              {title}
            </h3>
            
            {/* Description with Smooth Reveal */}
            <div className="overflow-hidden">
              <p className="text-base font-medium leading-relaxed text-gray-600 dark:text-gray-300
                          group-hover:text-gray-700 dark:group-hover:text-gray-200
                          transition-colors duration-300
                          transform translate-y-0 group-hover:translate-y-0
                          opacity-90 group-hover:opacity-100">
                {paragraph}
              </p>
            </div>

            {/* Animated Accent Line */}
            <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-indigo-500 to-purple-600 
                          group-hover:w-12 transition-all duration-700 ease-out rounded-full"></div>
          </div>
        </div>

        {/* Corner Decoration */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 
                      rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100
                      transition-all duration-500 delay-300"></div>
      </div>


    </div>
  );
};

export default SingleFeature;