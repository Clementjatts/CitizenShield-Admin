import React from 'react';
import { Mail, Phone, MessageSquare, Send, Clock } from 'lucide-react';

const ContactUs: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
    // Add your form submission logic here
  };

  return (
    <div className="bg-gradient-to-br from-blue-400 to-teal-300 min-h-screen p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 sm:p-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-800">Get in Touch</h2>
              <p className="mb-6 sm:mb-8 text-gray-600 text-lg">
                We're here to help and answer any question you might have. We look forward to hearing from you.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    id="name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    id="email"
                    type="email"
                    placeholder="Your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    id="message"
                    rows={5}
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
                <button
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center text-lg font-semibold"
                  type="submit"
                >
                  <Send className="mr-3" size={24} />
                  Send Message
                </button>
              </form>
            </div>
            <div className="md:w-1/2 bg-blue-600 text-white p-8 sm:p-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Phone className="mr-4 text-teal-300 flex-shrink-0" size={28} />
                  <span className="text-lg">+1 (123) 456-7890</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-4 text-teal-300 flex-shrink-0" size={28} />
                  <span className="text-lg">info@citizenshield.com</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="mr-4 text-teal-300 flex-shrink-0" size={28} />
                  <span className="text-lg">@CitizenShield</span>
                </div>
              </div>
              <div className="mt-10 sm:mt-12">
                <h4 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
                  <Clock className="mr-3 text-teal-300 flex-shrink-0" size={28} />
                  Office Hours
                </h4>
                <p className="text-lg mb-2">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-lg mb-2">Saturday: 10:00 AM - 2:00 PM</p>
                <p className="text-lg">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;