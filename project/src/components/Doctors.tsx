import React from 'react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
}

const Doctors = () => {
  const doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. James Wilson',
      specialty: 'Cardiologist',
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      specialty: 'Neurologist',
      image: 'https://images.pexels.com/photos/5214976/pexels-photo-5214976.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 3,
      name: 'Dr. Michael Chen',
      specialty: 'Pediatrician',
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ];

  return (
    <section id="doctors" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-3">Meet Our Experts</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Our experienced medical professionals are here to ensure you receive top-tier healthcare.
          </p>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="h-64 w-full overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-blue-800">{doctor.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{doctor.specialty}</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-medium transition">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full font-medium transition duration-300">
            View All Doctors
          </button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
