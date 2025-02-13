"use client"
import { useRef, useState, useEffect } from "react";

const List = ({name, children} : {name : string, children : React.ReactNode}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef(0);
    const [rightScroll, changeRightScroll] = useState(true)
    const [leftScroll, changeLeftScroll] = useState(true);

    const updateScrollStates = () => {
      if (scrollContainerRef.current) {
        const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
        changeLeftScroll(scrollRef.current > 0);
        changeRightScroll(scrollRef.current < maxScroll);
      }
    };

    const handleScroll = (amount : number) => {
        if (scrollContainerRef.current) {
          scrollRef.current += amount;
          const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
          const thisScroll = Math.max(0, Math.min(scrollRef.current, maxScroll));
          updateScrollStates()
          scrollRef.current = thisScroll
          scrollContainerRef.current.scrollTo({
            left: thisScroll,
            behavior: 'smooth',
          });
        }
      };

      useEffect(() => {
        updateScrollStates()
      }, []);

    return <div className="w-[95%] p-3 bg-[#272727] rounded-md shadow-md mx-auto mt-5">
        <div className="mb-3 flex flex-row">
           <h1 className="text-3xl font-bold">{name}</h1> 
           <div className="ml-auto">
                <button className={`text-2xl rounded-full bg-[#363636] w-8 mx-2 font-bold ${leftScroll ? 'visible' : 'invisible'}`} onClick={() => handleScroll(-(scrollContainerRef.current?.clientWidth ?? 0) / 1.5)}>&lt;</button>
                <button className={`text-2xl rounded-full bg-[#363636] w-8 mx-2 font-bold ${rightScroll ? 'visible' : 'invisible'}`} onClick={() => handleScroll((scrollContainerRef.current?.clientWidth ?? 0) / 1.5)}>&gt;</button>
           </div>
        </div>
        
        <div className="flex flex-row overflow-hidden flex-shrink-0" ref={scrollContainerRef}>
            {children}
        </div>
    </div>
}

export default List 