// Mock Appointments
export const mockAppointments = [
  {
    id: '1',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    doctorId: 'd1',
    doctorName: 'Dr. Michael Chen',
    date: '2025-07-15',
    time: '09:30',
    reason: 'Annual Physical',
    status: 'confirmed',
  },
  {
    id: '2',
    patientId: 'p2',
    patientName: 'Robert Williams',
    doctorId: 'd1',
    doctorName: 'Dr. Michael Chen',
    date: '2025-07-15',
    time: '11:00',
    reason: 'Follow-up on medication',
    status: 'confirmed',
  },
  {
    id: '3',
    patientId: 'p3',
    patientName: 'Emma Davis',
    doctorId: 'd1',
    doctorName: 'Dr. Michael Chen',
    date: '2025-07-15',
    time: '14:15',
    reason: 'Chronic pain management',
    status: 'pending',
  },
  {
    id: '4',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    doctorId: 'd2',
    doctorName: 'Dr. Lisa Rodriguez',
    date: '2025-07-22',
    time: '10:45',
    reason: 'Blood test results review',
    status: 'confirmed',
  },
];

// Mock Electronic Medical Records
export const mockEMRs = {
  p1: {
    patientId: 'p1',
    name: 'Sarah Johnson',
    dob: '1985-06-12',
    gender: 'Female',
    allergies: ['Penicillin', 'Peanuts'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2023-01-15',
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: '2022-11-03',
      },
    ],
    vitalSigns: {
      bloodPressure: '138/85',
      heartRate: 78,
      temperature: 98.6,
      oxygenSaturation: 98,
      height: 165,
      weight: 72,
    },
    labResults: [
      {
        name: 'Complete Blood Count',
        date: '2025-06-01',
        results: {
          wbc: '7.2 K/uL',
          rbc: '4.8 M/uL',
          hgb: '14.2 g/dL',
          hct: '42.1%',
          plt: '250 K/uL',
        },
        status: 'normal',
      },
      {
        name: 'Comprehensive Metabolic Panel',
        date: '2025-06-01',
        results: {
          glucose: '142 mg/dL',
          bun: '15 mg/dL',
          creatinine: '0.9 mg/dL',
          sodium: '138 mEq/L',
          potassium: '4.2 mEq/L',
          calcium: '9.5 mg/dL',
        },
        status: 'abnormal',
        notes: 'Elevated glucose levels',
      },
    ],
  },
  p2: {
    patientId: 'p2',
    name: 'Robert Williams',
    dob: '1978-09-23',
    gender: 'Male',
    allergies: ['Sulfa drugs', 'Latex'],
    conditions: ['Asthma', 'Seasonal allergies'],
    medications: [
      {
        name: 'Albuterol',
        dosage: '90mcg',
        frequency: 'As needed',
        startDate: '2021-03-17',
      },
      {
        name: 'Fluticasone',
        dosage: '50mcg',
        frequency: 'Once daily',
        startDate: '2022-05-10',
      },
    ],
    vitalSigns: {
      bloodPressure: '122/78',
      heartRate: 72,
      temperature: 98.2,
      oxygenSaturation: 97,
      height: 180,
      weight: 85,
    },
    labResults: [
      {
        name: 'Pulmonary Function Test',
        date: '2025-05-15',
        results: {
          fev1: '3.2 L',
          fvc: '4.1 L',
          fev1Fvc: '78%',
        },
        status: 'normal',
      },
    ],
  },
  p3: {
    patientId: 'p3',
    name: 'Emma Davis',
    dob: '1990-11-30',
    gender: 'Female',
    allergies: ['None known'],
    conditions: ['Migraine', 'Anxiety'],
    medications: [
      {
        name: 'Sumatriptan',
        dosage: '50mg',
        frequency: 'As needed for migraine',
        startDate: '2023-08-22',
      },
      {
        name: 'Sertraline',
        dosage: '50mg',
        frequency: 'Once daily',
        startDate: '2023-05-10',
      },
    ],
    vitalSigns: {
      bloodPressure: '118/75',
      heartRate: 68,
      temperature: 98.4,
      oxygenSaturation: 99,
      height: 170,
      weight: 65,
    },
    labResults: [
      {
        name: 'Thyroid Panel',
        date: '2025-04-20',
        results: {
          tsh: '2.5 mIU/L',
          t4: '1.2 ng/dL',
          t3: '120 ng/dL',
        },
        status: 'normal',
      },
    ],
  },
};

// Mock Billing Information
export const mockBillingInfo = {
  p1: {
    patientId: 'p1',
    insuranceProvider: 'Blue Cross Blue Shield',
    policyNumber: 'BCBS12345678',
    groupNumber: 'GRP987654',
    coverageStart: '2025-01-01',
    coverageEnd: '2025-12-31',
    copay: 25,
    deductibleRemaining: 350,
    recentClaims: [
      {
        id: 'cl1',
        date: '2025-06-01',
        service: 'Annual Physical',
        billed: 250,
        approved: 200,
        paid: 175,
        patientResponsibility: 25,
        status: 'processed',
        validationIssues: [],
      },
      {
        id: 'cl2',
        date: '2025-05-15',
        service: 'Lab Work - Comprehensive Panel',
        billed: 180,
        approved: 150,
        paid: 120,
        patientResponsibility: 30,
        status: 'processed',
        validationIssues: [],
      },
    ],
  },
  p2: {
    patientId: 'p2',
    insuranceProvider: 'Aetna',
    policyNumber: 'AET87654321',
    groupNumber: 'GRP123456',
    coverageStart: '2025-01-01',
    coverageEnd: '2025-12-31',
    copay: 20,
    deductibleRemaining: 500,
    recentClaims: [
      {
        id: 'cl3',
        date: '2025-05-28',
        service: 'Pulmonary Function Test',
        billed: 320,
        approved: 280,
        paid: 224,
        patientResponsibility: 56,
        status: 'processed',
        validationIssues: [],
      },
      {
        id: 'cl4',
        date: '2025-06-10',
        service: 'Medication Refill Visit',
        billed: 150,
        approved: 120,
        paid: 0,
        patientResponsibility: 120,
        status: 'pending',
        validationIssues: ['Missing diagnosis code', 'Requires prior authorization'],
      },
    ],
  },
  p3: {
    patientId: 'p3',
    insuranceProvider: 'UnitedHealthcare',
    policyNumber: 'UHC56781234',
    groupNumber: 'GRP654321',
    coverageStart: '2025-01-01',
    coverageEnd: '2025-12-31',
    copay: 30,
    deductibleRemaining: 750,
    recentClaims: [
      {
        id: 'cl5',
        date: '2025-04-20',
        service: 'Thyroid Panel',
        billed: 210,
        approved: 180,
        paid: 126,
        patientResponsibility: 54,
        status: 'processed',
        validationIssues: [],
      },
    ],
  },
};

// Mock Lifestyle Recommendations
export const mockLifestyleTips = {
  p1: {
    patientId: 'p1',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    recommendations: {
      diet: {
        dos: [
          'Increase vegetables and fruits (aim for half your plate)',
          'Choose whole grains over refined carbohydrates',
          'Include lean proteins like fish, chicken, and plant-based proteins',
          'Stay hydrated with water instead of sugary drinks',
        ],
        donts: [
          'Limit sodium intake to less than 2,300mg daily',
          'Avoid processed foods high in added sugars',
          'Limit alcohol consumption',
          'Avoid high-fat dairy and fatty cuts of meat',
        ],
      },
      exercise: {
        dos: [
          'Aim for 150 minutes of moderate exercise weekly',
          'Include both cardio and strength training',
          'Take short walking breaks throughout the day',
          'Monitor blood glucose before and after exercise',
        ],
        donts: [
          'Avoid exercising without proper footwear',
          'Don\'t exercise when blood glucose is too high or too low',
          'Avoid prolonged sitting throughout the day',
        ],
      },
      monitoring: {
        dos: [
          'Check blood pressure daily',
          'Monitor blood glucose as recommended',
          'Keep a food diary',
          'Track your exercise',
        ],
        donts: [
          'Don\'t skip medication doses',
          'Avoid missing follow-up appointments',
        ],
      },
    },
  },
  p2: {
    patientId: 'p2',
    conditions: ['Asthma', 'Seasonal allergies'],
    recommendations: {
      diet: {
        dos: [
          'Eat foods rich in antioxidants like fruits and vegetables',
          'Include omega-3 fatty acids from fish and nuts',
          'Stay well-hydrated',
        ],
        donts: [
          'Avoid known food allergens',
          'Be cautious with sulfites in wine and preserved foods',
          'Limit processed foods with artificial preservatives',
        ],
      },
      exercise: {
        dos: [
          'Warm up properly before exercise',
          'Consider indoor exercise during high pollen days',
          'Keep rescue inhaler accessible during physical activity',
          'Swimming can be beneficial for lung capacity',
        ],
        donts: [
          'Avoid exercising in cold, dry air',
          'Don\'t exercise outdoors during high pollution days',
          'Avoid exercising during acute asthma symptoms',
        ],
      },
      environment: {
        dos: [
          'Use HEPA air filters at home',
          'Keep indoor humidity between 30-50%',
          'Regularly clean to reduce dust and allergens',
          'Check pollen counts before outdoor activities',
        ],
        donts: [
          'Avoid smoking and secondhand smoke',
          'Don\'t keep pets in bedroom if pet allergies exist',
          'Avoid strong perfumes and chemical cleaners',
        ],
      },
    },
  },
  p3: {
    patientId: 'p3',
    conditions: ['Migraine', 'Anxiety'],
    recommendations: {
      diet: {
        dos: [
          'Maintain regular meal times',
          'Stay hydrated throughout the day',
          'Consider magnesium-rich foods like dark leafy greens',
          'Include complex carbohydrates for stable blood sugar',
        ],
        donts: [
          'Avoid known migraine triggers (aged cheese, processed meats)',
          'Limit caffeine and alcohol',
          'Avoid skipping meals',
        ],
      },
      lifestyle: {
        dos: [
          'Establish a consistent sleep schedule',
          'Practice stress-reduction techniques daily',
          'Use a headache diary to identify triggers',
          'Incorporate gentle exercise like walking or yoga',
        ],
        donts: [
          'Avoid excessive screen time without breaks',
          'Don\'t ignore early migraine warning signs',
          'Avoid high-stress situations when possible',
        ],
      },
      anxiety: {
        dos: [
          'Practice daily mindfulness or meditation',
          'Engage in regular physical activity',
          'Maintain social connections',
          'Consider cognitive behavioral techniques',
        ],
        donts: [
          'Avoid excessive news consumption if triggering',
          'Limit stimulants like caffeine',
          'Don\'t ignore persistent anxiety symptoms',
        ],
      },
    },
  },
};

// User Data
export const mockUsers = {
  doctors: [
    {
      id: 'd1',
      role: 'doctor',
      name: 'Dr. Michael Chen',
      specialty: 'Internal Medicine',
      email: 'dr.chen@example.com',
      password: 'password', // In a real app, this would be properly hashed
    },
    {
      id: 'd2',
      role: 'doctor',
      name: 'Dr. Lisa Rodriguez',
      specialty: 'Endocrinology',
      email: 'dr.rodriguez@example.com',
      password: 'password',
    },
  ],
  patients: [
    {
      id: 'p1',
      role: 'patient',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'password',
    },
    {
      id: 'p2',
      role: 'patient',
      name: 'Robert Williams',
      email: 'robert@example.com',
      password: 'password',
    },
    {
      id: 'p3',
      role: 'patient',
      name: 'Emma Davis',
      email: 'emma@example.com',
      password: 'password',
    },
  ],
};