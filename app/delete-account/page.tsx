import React from 'react';
import SectionTitle from '../../components/Common/SectionTitle';
import Breadcrumb from '../../components/Common/Breadcrumb';

const DeleteAccountPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Delete My Account"
        description="Guide to securely delete your account and understand our privacy practices."
      />

      <section className="pb-[120px] pt-[150px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <SectionTitle
                title="Delete My Account"
                paragraph="We understand that you may want to delete your account at any time. This guide will walk you through the process and explain how we handle your information."
                center
                mb="60px"
              />

              <div className="wow fadeInUp" data-wow-delay=".2s">
                <div className="mb-9 rounded-md bg-white p-6 shadow-three dark:bg-dark sm:p-10">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl">
                    Important Privacy Notice
                  </h3>
                  <p className="mb-4 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                    Your credentials and personal information are kept strictly confidential. We do not share, sell, or disclose your data to third parties without your explicit consent, except as required by law. Deleting your account will permanently remove your data from our systems.
                  </p>

                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl">
                    How to Delete Your Account
                  </h3>
                  <ol className="list-decimal list-inside mb-4 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                    <li className="mb-2">Log in to your account on our website.</li>
                    <li className="mb-2">Navigate to your account settings or profile page.</li>
                    <li className="mb-2">Look for the "Delete Account" or "Account Deletion" option.</li>
                    <li className="mb-2">Follow the on-screen prompts to confirm your decision.</li>
                    <li className="mb-2">You may be asked to provide a reason for deletion (optional).</li>
                    <li className="mb-2">Enter your password to verify your identity.</li>
                    <li className="mb-2">Click "Delete Account" to complete the process.</li>
                  </ol>

                  <p className="mb-4 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                    Once deleted, your account cannot be recovered. If you change your mind, you'll need to create a new account.
                  </p>

                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl">
                    What Happens to Your Data?
                  </h3>
                  <p className="mb-4 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                    Upon account deletion, all your personal data, including profile information, medical history (if applicable), and any stored credentials, will be permanently removed from our servers. We retain no copies of your data after deletion.
                  </p>

                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl">
                    Need Help?
                  </h3>
                  <p className="text-base leading-relaxed text-body-color dark:text-body-color-dark">
                    If you encounter any issues or have questions about deleting your account, please contact our support team at support@medifind-now.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DeleteAccountPage;