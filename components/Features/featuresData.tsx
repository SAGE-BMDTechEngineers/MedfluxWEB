const featuresData = [
  {
    id: 1,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.75h4.5m-2.25 6v6m-4.5 0h9M4.5 21h15M7.5 10.5v6m9-6v6"
        />
      </svg>
    ),
    title: "Inventory Management",
    paragraph: "Track inventory levels with precision, minimize stock shortages, and reduce excess waste through real-time monitoring, ensuring optimal resource allocation and improved operational efficiency.",
  },
  {
    id: 2,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5l3.75 3.75M12 3v3.75m0 0v4.5m6-8.25h1.5M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z"
        />
      </svg>
    ),
    title: "Analytics and Insights",
    paragraph: "Gain actionable insights into sales trends, optimize marketing strategies, and understand customer preferences to improve overall business performance and decision-making.",
  },
  {
    id: 3,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5h18m-18-3.75h18m-18-3.75h18m-18-3.75h18M12 9.75l4.5-4.5M12 14.25l4.5 4.5"
        />
      </svg>
    ),
    title: "Point of Sale (POS)",
    paragraph: "Streamline payment processes, manage sales transactions efficiently, and integrate financial reporting tools to enhance operational control.",
  },
  {
    id: 4,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.75v4.876M8.25 10.125h7.5M15.375 14.25H8.625M12 17.25v-2.625M6 9.375C6 6.471 8.348 4.125 11.25 4.125S16.5 6.471 16.5 9.375c0 2.19-.845 3.24-1.668 4.197-.773.897-1.636 1.712-2.43 2.598a.75.75 0 01-1.104 0c-.794-.886-1.657-1.7-2.43-2.598-.823-.957-1.668-2.007-1.668-4.197z"
        />
      </svg>
    ),
    title: "Geolocation",
    paragraph: "Leverage real-time geolocation tracking for efficient delivery management, timely dispatch, and a better customer experience with reduced delays.",
  },
  {
    id: 5,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 12h16.5M3.75 16.5h16.5M3.75 19.5h16.5M12 2.625c5.064 0 9.375 4.311 9.375 9.375s-4.311 9.375-9.375 9.375S2.625 17.064 2.625 12 6.936 2.625 12 2.625z"
        />
      </svg>
    ),
    title: "Delivery",
    paragraph: "Optimize delivery routes, track shipments in real-time, and ensure accurate, on-time service to boost customer satisfaction.",
  },
  {
    id: 6,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path
          opacity="0.5"
          d="M20 30C22.75 30 25 32.25 25 35C25 37.75 22.75 40 20 40C17.25 40 15 37.75 15 35C15 32.25 17.25 30 20 30ZM35 30C37.75 30 40 32.25 40 35C40 37.75 37.75 40 35 40C32.25 40 30 37.75 30 35C30 32.25 32.25 30 35 30ZM35 15C37.75 15 40 17.25 40 20C40 22.75 37.75 25 35 25C32.25 25 30 22.75 30 20C30 17.25 32.25 15 35 15Z"
        />
        <path d="M20 15C22.75 15 25 17.25 25 20C25 22.75 22.75 25 20 25C17.25 25 15 22.75 15 20C15 17.25 17.25 15 20 15ZM20 0C22.75 0 25 2.25 25 5C25 7.75 22.75 10 20 10C17.25 10 15 7.75 15 5C15 2.25 17.25 0 20 0ZM5 30C7.75 30 10 32.25 10 35C10 37.75 7.75 40 5 40C2.25 40 0 37.75 0 35C0 32.25 2.25 30 5 30ZM5 15C7.75 15 10 17.25 10 20C10 22.75 7.75 25 5 25C2.25 25 0 22.75 0 20C0 17.25 2.25 15 5 15ZM5 0C7.75 0 10 2.25 10 5C10 7.75 7.75 10 5 10C2.25 10 0 7.75 0 5C0 2.25 2.25 0 5 0ZM35 0C37.75 0 40 2.25 40 5C40 7.75 37.75 10 35 10C32.25 10 30 7.75 30 5C30 2.25 32.25 0 35 0Z" />
      </svg>
    ),
    title: "Prescription Management",
    paragraph: "Digitize prescription records, enable faster refills, and enhance patient trust through seamless tracking and accessibility.",
  },
];

export default featuresData;
