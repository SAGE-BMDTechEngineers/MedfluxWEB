import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Image from "next/image";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Page",
  description: "",
  // other metadata
};

const AboutPage = () => {
  return (
    <>
   <div className="bg-white ">
   <section className=" w-full   flex justify-center items-center py-24 pt-28 px-4 bg-white">
  <div className="container  border-2 ring-2 ring-black dark:ring-white dark:bg-black text-center md:text-left flex flex-col md:flex-row rounded-2xl bg-indigo-600 items-center">
    <div className="text-left space-y-6 md:w-1/2">
      <h1 className="text-4xl text-white font-extrabold leading-tight md:text-5xl">
        About Our Vision for Better Healthcare
      </h1>
      <p className="text-lg md:text-xl text-white/80">
        Assisting Africans in connecting with pharmacies and hospitals from the comfort of their own homes, while providing the ability to track medical records and medications.
      </p>
    </div>

    <div className="">
      <Image 
        src="/images/about/6.png" 
        alt="Healthcare Icon"
        width={800}
        height={700}
      />
    </div>
  </div>
</section>


     <div className="flex container md:space-x-7 md:my-44 my-5 items-center justify-center flex-col md:flex-row">
     <div className="mockup-phone hidden md:block border-primary">
    <div className="camera"></div>
    <div className="display">
      <div className="artboard artboard-demo phone-1">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover"
        >
          <source src="/images/video/6130027-hd_1920_1080_30fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
  <div className="mb-16 space-y-2 md:w-[750px] w-[350px] my-16 md:my-0 ">
    <h2 className="mb-6 font-extrabold text-2xl md:text-3xl leading-snug dark:text-black text-indigo-600">
      Our Mission: Bridging Healthcare Access for All
    </h2>
    <p className="text-gray-900 dark:text-black">
      Our goal is to provide seamless access to pharmacies and healthcare services, helping individuals connect with trusted professionals from the comfort of their own homes. We aim to empower communities by offering convenient and efficient ways to manage healthcare needs, track medication, and receive expert support—whether at home, on the go, or in person.
    </p>
    <ul className="list mb-6 space-y-8 text-gray-900 dark:text-black">
      <li className="flex space-x-2">
        <i className="">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Add-Circle-Bold--Streamline-Ultimate" height="24" width="24">
            <desc>Add Circle Bold Streamline Icon: https://streamlinehq.com</desc>
            <path stroke="#3949AB" stroke-linecap="round" stroke-linejoin="round" d="M0.75 12c0 2.9837 1.18526 5.8452 3.29505 7.955C6.15483 22.0647 9.01631 23.25 12 23.25c2.9837 0 5.8452 -1.1853 7.955 -3.295 2.1097 -2.1098 3.295 -4.9713 3.295 -7.955 0 -2.98369 -1.1853 -5.84517 -3.295 -7.95495C17.8452 1.93526 14.9837 0.75 12 0.75c-2.98369 0 -5.84517 1.18526 -7.95495 3.29505C1.93526 6.15483 0.75 9.01631 0.75 12Z" stroke-width="1.5"></path>
            <path stroke="#3949AB" stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75h-3v-3c0 -0.39782 -0.158 -0.77936 -0.4393 -1.06066 -0.2813 -0.2813 -0.6629 -0.43934 -1.0607 -0.43934h-1.5c-0.3978 0 -0.7794 0.15804 -1.0607 0.43934 -0.28126 0.2813 -0.4393 0.66284 -0.4393 1.06066v3h-3c-0.39782 0 -0.77936 0.15804 -1.06066 0.4393 -0.2813 0.2813 -0.43934 0.6629 -0.43934 1.0607v1.5c0 0.3978 0.15804 0.7794 0.43934 1.0607s0.66284 0.4393 1.06066 0.4393h3v3c0 0.3978 0.15804 0.7794 0.4393 1.0607 0.2813 0.2813 0.6629 0.4393 1.0607 0.4393h1.5c0.3978 0 0.7794 -0.158 1.0607 -0.4393s0.4393 -0.6629 0.4393 -1.0607v-3h3c0.3978 0 0.7794 -0.158 1.0607 -0.4393s0.4393 -0.6629 0.4393 -1.0607v-1.5c0 -0.3978 -0.158 -0.7794 -0.4393 -1.0607 -0.2813 -0.28126 -0.6629 -0.4393 -1.0607 -0.4393Z" stroke-width="1.5"></path>
          </svg>
        </i>
        <div className="dark:text-black">
          Our vision is to make healthcare accessible to everyone, everywhere, by connecting individuals to pharmacies and hospitals with ease, allowing them to track their medications, get advice, and access prescriptions from any location.
        </div>
      </li>
      <li className="flex space-x-2">
        <i className="">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Chat-Icon" height="24" width="24">
            <desc>Chat Icon</desc>
            <circle cx="12" cy="12" r="10" stroke="#3949AB" stroke-width="1.5"></circle>
            <path d="M8 10h8M8 14h5" stroke="#3949AB" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </i>
        <div className="dark:text-black">
          Our service fosters communication with healthcare professionals in real-time, ensuring that users receive the best advice and care when they need it.
        </div>
      </li>
      <li className="flex space-x-2">
        <i className="">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Tracking-Icon" height="24" width="24">
            <desc>Tracking Icon</desc>
            <circle cx="12" cy="12" r="10" stroke="#3949AB" stroke-width="1.5"></circle>
            <path d="M12 6v6h4" stroke="#3949AB" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </i>
        <div className="dark:text-black">
          Our goal is to provide full transparency in healthcare, where users can track their medication orders and receive real-time updates on their delivery status.
        </div>
      </li>
      <li className="flex space-x-2">
        <i className="">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Walk-In-Icon" height="24" width="24">
            <desc>Walk-In Icon</desc>
            <path d="M6 21V6h12v15" stroke="#3949AB" stroke-width="1.5"></path>
            <path d="M12 10v4" stroke="#3949AB" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </i>
        <div className="dark:text-whit dark:text-black">
          While we promote convenience through digital channels, we also support traditional healthcare experiences by offering in-person services where users can visit stores for personalized assistance.
        </div>
      </li>
      <li className="flex space-x-2">
        <i className="">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Pick-Up-Icon" height="24" width="24">
            <desc>Pick-Up Station Icon</desc>
            <circle cx="12" cy="12" r="10" stroke="#3949AB" stroke-width="1.5"></circle>
            <path d="M8 12h8" stroke="#3949AB" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </i>
        <div className="dark:text-whit dark:text-black">
          We are dedicated to creating solutions that empower our customers, offering convenient pick-up stations and reducing waiting times to enhance their overall healthcare experience.
        </div>
      </li>
    </ul>
  </div>
  <div className="mockup-phone  border-primary block md:hidden">
    <div className="camera"></div>
    <div className="display">
      <div className="artboard artboard-demo phone-1">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover"
        >
          <source src="/images/video/6130027-hd_1920_1080_30fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
</div>

      <AboutSectionOne />
      <AboutSectionTwo />
   </div>
    </>
  );
};

export default AboutPage;
