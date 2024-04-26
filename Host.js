const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const myapp = express();
const port = 3030;
const cookieParser = require('cookie-parser');
const router = express.Router();

myapp.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// Middleware to parse JSON requests
myapp.use(express.json());
myapp.use(express.urlencoded({ extended: true }));
myapp.use(cors());
myapp.use(cookieParser());
myapp.use(express.static('uploads'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  }
});

const upload = multer({ storage: storage });



myapp.set('view engine', 'ejs');
myapp.set('views', __dirname + '/view');
myapp.use(express.static(__dirname + '/assets'));
myapp.use(express.static(__dirname + '/uploads'));

// Supabase configuration
const { createClient, SupabaseClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rvclliowsbnowatrukem.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Y2xsaW93c2Jub3dhdHJ1a2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE2MDIzMDEsImV4cCI6MjAxNzE3ODMwMX0.Khui4wtODbFdxNcSTWhsNdgGW4mpb8kFSeCVz118gYI');

async function getUser(type, email) {
  if (type) {
    const { data } = await supabase
      .from(type)
      .select('*')
      .eq('email', email?.toUpperCase())
      .single();

    if (!data && type === 'Student Accounts') return getUser('Counselor Accounts', email)
    else false

    return data
  }
}

myapp.use(async (req, res, next) => {
  if (req.url.startsWith('/vendor') || req.url.startsWith('/img') || req.url.startsWith('/inactivity.js') || req.url.startsWith('/favicon.ico') || req.url.startsWith('/logout')) return next()

  const studentToken = req.cookies.userData;
  const studentUser = await supabase.auth.getUser(studentToken)
  const studentData = await getUser('Student Accounts', studentUser.data?.user?.email)

  res.locals.studentData = studentData;
  res.locals.counselorData = studentData;
  next();
});


//=========GETTING===========//
myapp.get('/', (req, res) => {
  res.render('LoginPage');
});

myapp.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword');
});

myapp.get('/changePassword', (req, res) => {
  res.render('changePassword',);
});

myapp.get('/Registerpage', (req, res) => {
  res.render('RegisterPage');
});

myapp.get('/StudentHomepage', (req, res) => {
  const studentData = res.locals.studentData;
  if (!studentData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  res.render('StudentHomepage', { studentData });
});

myapp.get('/studentProfilePage', (req, res) => {
  const studentData = res.locals.studentData;
  if (!studentData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  res.render('studentProfilePage', { studentData });
});

myapp.get('/CounselorViewReport', async (req, res) => {
  try {
    const timeEncoded = req.query.timeEncoded;

    if (!timeEncoded) {
      return res.status(400).send('Bad Request: Missing timeEncoded parameter');
    }

    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;

    // Handle the case where timeEncoded is null
    if (timeEncoded === 'null') {
      return res.status(400).send('Bad Request: Invalid timeEncoded parameter');
    }

    const { data: counselorLog, error } = await supabase
      .from('Report')
      .select('*')
      .eq('counselor_email', counselorEmail)
      .eq('time_encoded', timeEncoded);

    if (error) {
      console.error('Error fetching report:', error.message);
      return res.status(500).send('Internal server error');
    }

    if (counselorLog.length === 0) {
      return res.status(404).send('Report not found');
    }

    const log = counselorLog[0];

    // Render the EJS template with the retrieved data
    res.render('CounselorViewReport', { log });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/studentAppointmentStatus', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const studentData = res.locals.studentData;
    const studentEmail = studentData.email; // Assuming the email is stored in counselorData
    if (!studentData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch pending appointments data for all departments associated with the counselor
    const { data: pendingAppointment, error } = await supabase
      .from('Pending Appointment') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: acceptedAppointment, error1 } = await supabase
      .from('Accepted Appointment') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error1.message);
      return res.status(500).send('Internal server error');
    }

    res.render('studentAppointmentStatus', { studentData, pendingAppointment, acceptedAppointment });
  } catch (error1) {
    // Handle any unexpected server errors
    console.error('Server error:', error1.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/studentReschedules', async (req, res) => {
  try {
    const studentData = res.locals.studentData;
    const studentEmail = studentData.email;
    if (!studentData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch counselor's program
    const { data: studentPendingResched, error: studentPendingReschedError } = await supabase
      .from('Pending Reschedule') // Adjusted table name with a space
      .select('*')
      .eq('email', studentEmail);

    if (studentPendingReschedError) {
      console.error('Error fetching Resched:', studentPendingReschedError.message);
      return res.status(500).send('Internal server error');
    }


    res.render('studentReschedules', {
      studentData,
      studentPendingResched: studentPendingResched,
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/studentAppointmentHistory', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const studentData = res.locals.studentData;
    const studentEmail = studentData.email;  // Assuming the email is stored in counselorData
    if (!studentData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch pending appointments data for all departments associated with the counselor
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .in('prog_status', ['COMPLETED', 'REJECTED', 'CANCELLED'])
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    const { data: ignoredAppointmentHistory, error1 } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .in('prog_status', ['IGNORED'])
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error1.message);
      return res.status(500).send('Internal server error');
    }


    res.render('studentAppointmentHistory', { studentData, appointmentHistory, ignoredAppointmentHistory });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorList', (req, res) => {
  const studentData = res.locals.studentData;
  if (!studentData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  res.render('CounselorList', { studentData });
});

myapp.get('/CreateAppointmentPage', (req, res) => {
  const studentData = res.locals.studentData;
  if (!studentData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  res.render('CreateAppointmentPage', { studentData });
});

myapp.get('/CounselorHomePage', async (req, res) => {
  let hasNewAppointments;
  let filteredAppointments;

  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch counselor's departments
    const { data: counselorDepartments, error: counselorError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', counselorEmail);

    if (counselorError) {
      console.error('Error fetching counselor departments:', counselorError.message);
      return res.status(500).send('Internal server error');
    }

    const departments = counselorDepartments.map(entry => entry.department);

    // Fetch counselor's programs from 'Counselor Program' table
    const { data: counselorPrograms, error: programsError } = await supabase
      .from('Counselor Program')
      .select('program')
      .eq('email', counselorEmail);

    if (programsError) {
      console.error('Error fetching counselor programs:', programsError.message);
      return res.status(500).send('Internal server error');
    }

    const programs = counselorPrograms.map(entry => entry.program);

    // Fetch new appointments
    const { data: newAppointments, error: newAppointmentsError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .eq('notif', true)
      .order('date', { ascending: true });

    if (newAppointmentsError) {
      console.error('Error fetching new appointments:', newAppointmentsError.message);
      return res.status(500).send('Internal server error');
    }

    // Filter appointments based on program
    filteredAppointments = newAppointments.filter(appointment =>
      programs.some(program => appointment.progCode.includes(program))
    );

    hasNewAppointments = filteredAppointments.length > 0;

    // Fetch all pending appointments
    const { data: pendingAppointments, error } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    const currentTime = new Date();
    const updatedPendingAppointments = [];

    // Loop through pending appointments
    for (const appointment of pendingAppointments) {
      const appointedDateTime = new Date(`${appointment.appointed_date} ${appointment.appointed_time}`);

      if (currentTime > appointedDateTime) {
        // Prepare data for 'Appointment History' with REJECTED status
        const rejectedAppointmentData = {
          counselor_email: counselorEmail,
          counselor_Fname: counselorData.first_name,
          counselor_Lname: counselorData.last_name,
          date: appointment.appointed_date,
          time: appointment.appointed_time,
          email: appointment.email,
          department: appointment.department,
          first_name: appointment.first_name,
          last_name: appointment.last_name,
          appointed_date: appointment.appointed_date,
          appointed_time: appointment.appointed_time,
          progCode: appointment.progCode,
          prog_status: 'IGNORED'
          // Add other fields needed for the Appointment History table
        };

        // Insert rejected appointment in the 'Appointment History' table
        const { data: insertedAppointment, error: insertError } = await supabase
          .from('Appointment History')
          .insert(rejectedAppointmentData);

        if (insertError) {
          console.error('Error inserting rejected appointment:', insertError.message);
          // Handle the error if insertion fails
        }

        // Delete the rejected appointment from 'Pending Appointment'
        const { error: deleteError } = await supabase
          .from('Pending Appointment')
          .delete()
          .eq('id', appointment.id);

        if (deleteError) {
          console.error('Error deleting expired appointment:', deleteError.message);
          // Handle the error if deletion fails
        }
      } else {
        // Appointment is still pending, add it to the updated list
        updatedPendingAppointments.push(appointment);
      }
    }



    const pendingAppointmentsCount = filteredAppointments.length;

    res.render('CounselorHomePage', {
      counselorData,
      pendingAppointments: updatedPendingAppointments,
      hasNewAppointments: hasNewAppointments,
      pendingAppointmentsCount: pendingAppointmentsCount,
      filteredAppointments: filteredAppointments,
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorProfilePage', async (req, res) => {
  let hasNewAppointments;
  let filteredAppointments;

  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch counselor's departments
    const { data: counselorDepartments, error: counselorError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', counselorEmail);

    if (counselorError) {
      console.error('Error fetching counselor departments:', counselorError.message);
      return res.status(500).send('Internal server error');
    }

    const departments = counselorDepartments.map(entry => entry.department);

    // Fetch counselor's programs from 'Counselor Program' table
    const { data: counselorPrograms, error: programsError } = await supabase
      .from('Counselor Program')
      .select('program')
      .eq('email', counselorEmail);

    if (programsError) {
      console.error('Error fetching counselor programs:', programsError.message);
      return res.status(500).send('Internal server error');
    }

    const programs = counselorPrograms.map(entry => entry.program);

    // Fetch new appointments
    const { data: newAppointments, error: newAppointmentsError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .eq('notif', true)
      .order('date', { ascending: true });

    if (newAppointmentsError) {
      console.error('Error fetching new appointments:', newAppointmentsError.message);
      return res.status(500).send('Internal server error');
    }

    // Filter appointments based on program
    filteredAppointments = newAppointments.filter(appointment =>
      programs.some(program => appointment.progCode.includes(program))
    );

    hasNewAppointments = filteredAppointments.length > 0;

    // Fetch all pending appointments
    const { data: pendingAppointments, error } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    const currentTime = new Date();
    const updatedPendingAppointments = [];

    // Loop through pending appointments
    for (const appointment of pendingAppointments) {
      const appointedDateTime = new Date(`${appointment.appointed_date} ${appointment.appointed_time}`);

      if (currentTime > appointedDateTime) {
        // Prepare data for 'Appointment History' with REJECTED status
        const rejectedAppointmentData = {
          counselor_email: counselorEmail,
          counselor_Fname: counselorData.first_name,
          counselor_Lname: counselorData.last_name,
          date: appointment.appointed_date,
          time: appointment.appointed_time,
          email: appointment.email,
          department: appointment.department,
          first_name: appointment.first_name,
          last_name: appointment.last_name,
          appointed_date: appointment.appointed_date,
          appointed_time: appointment.appointed_time,
          progCode: appointment.progCode,
          prog_status: 'IGNORED'
          // Add other fields needed for the Appointment History table
        };

        // Insert rejected appointment in the 'Appointment History' table
        const { data: insertedAppointment, error: insertError } = await supabase
          .from('Appointment History')
          .insert(rejectedAppointmentData);

        if (insertError) {
          console.error('Error inserting rejected appointment:', insertError.message);
          // Handle the error if insertion fails
        }

        // Delete the rejected appointment from 'Pending Appointment'
        const { error: deleteError } = await supabase
          .from('Pending Appointment')
          .delete()
          .eq('id', appointment.id);

        if (deleteError) {
          console.error('Error deleting expired appointment:', deleteError.message);
          // Handle the error if deletion fails
        }
      } else {
        // Appointment is still pending, add it to the updated list
        updatedPendingAppointments.push(appointment);
      }
    }

    counselorData.department = departments;
    counselorData.program = programs;

    const pendingAppointmentsCount = filteredAppointments.length;

    res.render('CounselorProfilePage', {
      counselorData,
      pendingAppointments: updatedPendingAppointments,
      hasNewAppointments: hasNewAppointments,
      pendingAppointmentsCount: pendingAppointmentsCount,
      filteredAppointments: filteredAppointments,
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorPendingAppointmentPage', async (req, res) => {
  let hasNewAppointments;
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch counselor's program
    const { data: counselorProgramData, error: counselorProgramError } = await supabase
      .from('Counselor Program') // Adjusted table name with a space
      .select('program')
      .eq('email', counselorEmail);

    if (counselorProgramError) {
      console.error('Error fetching counselor program:', counselorProgramError.message);
      return res.status(500).send('Internal server error');
    }

    const counselorPrograms = counselorProgramData.map(entry => entry.program);

    // Fetch counselor's departments
    const { data: counselorDepartments, error: counselorError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', counselorEmail);

    if (counselorError) {
      console.error('Error fetching counselor departments:', counselorError.message);
      return res.status(500).send('Internal server error');
    }

    const departments = counselorDepartments.map(entry => entry.department);

    // Fetch new appointments
    const { data: newAppointments, error: newAppointmentsError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .eq('notif', true)
      .order('date', { ascending: true });

    if (newAppointmentsError) {
      console.error('Error fetching new appointments:', newAppointmentsError.message);
      return res.status(500).send('Internal server error');
    }

    hasNewAppointments = newAppointments.length > 0;

    // Fetch all pending appointments
    const { data: pendingAppointments, error } = await supabase
      .from('Pending Appointment')
      .select('*');

    if (error) {
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    // Filter appointments based on counselor's program and department
    const filteredAppointments = pendingAppointments.filter(appointment => {
      // Check if counselor's program matches the prefix of the appointment's progCode and department
      const matchingProgram = counselorPrograms.some(program => appointment.progCode.startsWith(program));
      const matchingDepartment = departments.includes(appointment.department);

      return matchingProgram && matchingDepartment;
    });

    const currentTime = new Date();
    const updatedPendingAppointments = [];

    // Loop through pending appointments
    for (const appointment of filteredAppointments) {
      const appointedDateTime = new Date(`${appointment.appointed_date} ${appointment.appointed_time}`);

      if (currentTime > appointedDateTime) {
        // Prepare data for 'Appointment History' with REJECTED status
        const rejectedAppointmentData = {
          counselor_email: counselorEmail,
          counselor_Fname: counselorData.first_name,
          counselor_Lname: counselorData.last_name,
          date: appointment.appointed_date,
          time: appointment.appointed_time,
          email: appointment.email,
          department: appointment.department,
          first_name: appointment.first_name,
          last_name: appointment.last_name,
          appointed_date: appointment.appointed_date,
          appointed_time: appointment.appointed_time,
          prog_status: 'IGNORED'
          // Add other fields needed for the Appointment History table
        };

        // Insert rejected appointment in the 'Appointment History' table
        const { data: insertedAppointment, error: insertError } = await supabase
          .from('Appointment History')
          .insert(rejectedAppointmentData);

        if (insertError) {
          console.error('Error inserting rejected appointment:', insertError.message);
          // Handle the error if insertion fails
        }

        // Delete the rejected appointment from 'Pending Appointment'
        const { error: deleteError } = await supabase
          .from('Pending Appointment')
          .delete()
          .eq('id', appointment.id);

        if (deleteError) {
          console.error('Error deleting expired appointment:', deleteError.message);
          // Handle the error if deletion fails
        }
      } else {
        // Appointment is still pending, add it to the updated list
        updatedPendingAppointments.push(appointment);
      }
    }

    // Update new_flag for the viewed appointments
    for (const appointment of updatedPendingAppointments) {
      const { error: updateError } = await supabase
        .from('Pending Appointment')
        .update({ notif: false })
        .eq('id', appointment.id);

      if (updateError) {
        console.error('Error updating appointment status:', updateError.message);
        // Handle the error if the update fails
      }
    }

    res.render('CounselorPendingAppointmentPage', {
      counselorData,
      pendingAppointments: updatedPendingAppointments,
      hasNewAppointments: hasNewAppointments,
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorAcceptedAppointmentPage', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email; // Assuming the email is stored in counselorData
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch pending appointments data for all departments associated with the counselor
    const { data: acceptedAppointments, error } = await supabase
      .from('Accepted Appointment') // Replace with your actual table name
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorAcceptedAppointmentPage', { counselorData, acceptedAppointments });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorAppointmentHistoryPage', async (req, res) => {
  try {

    // Extract counselor's email from the session data
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email; // Assuming the email is stored in counselorData
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    // Fetch pending appointments data for all departments associated with the counselor
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorAppointmentHistoryPage', { counselorData, appointmentHistory });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorLogs', async (req, res) => {
  try {

    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    const { data: counselorLog, error } = await supabase
      .from('Report')
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date_encoded', { ascending: true }, 'time_encoded', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorLogs', { counselorLog, });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorReport', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    const counselorEmail = counselorData.email;
    const { data: counselorReport, error } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }, 'time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorReport', { counselorReport, });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorManualReport', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    if (!counselorData) {
      // Redirect to the login page if studentData is not present
      res.redirect('/');
      return; // Important: End the request-response cycle to avoid further processing
    }
    const counselorEmail = counselorData.email;
    const { data: counselorReport, error } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }, 'time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorManualReport', { counselorReport, });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/emailSuggestions', async (req, res) => {
  const userInput = req.query.input;
  const { data: suggestedEmails, error } = await supabase
    .from('Student Accounts')
    .select('*')
    .ilike('email', `%${userInput}%`);

  if (error) {
    // Handle error, if necessary
    console.error('Error fetching student data:', error);
    return res.status(500).json({ error: 'Error fetching suggestions' });
  }

  res.json({ suggestions: suggestedEmails });
});

myapp.get('/adminHomepage', (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  res.render('adminHomepage', { counselorData });
});

myapp.get('/adminStatisticsForm', (req, res) => {
  res.render('adminStatisticsForm');
});

myapp.get('/adminCreateAccounts', (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  res.render('adminCreateAccounts', { counselorData });
});

myapp.get('/adminAppointmentHistory', async (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  try {
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminAppointmentHistory', { appointmentHistory, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminAcceptedAppointment', async (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  try {
    const { data: acceptedAppointment, error } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminAcceptedAppointment', { acceptedAppointment, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminPendingAppointment', async (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  try {
    const { data: pendingAppointment, error } = await supabase
      .from('Pending Appointment')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminPendingAppointment', { pendingAppointment, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminViewAccounts', async (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  try {
    const { data: studentViewAccounts, error: studentError } = await supabase
      .from('Student Accounts')
      .select('*')
      .eq('archiveStudent', false)
      .order('email', { ascending: true });

    if (studentError) {
      console.error('Error fetching appointments:', studentError.message);
      return res.status(500).send('Internal server error');
    }
    const { data: counselorViewAccounts, error: counselorError } = await supabase
      .from('Counselor Accounts')
      .select('*')
      .eq('archiveCounselor', false)
      .order('email', { ascending: true });

    if (counselorError) {
      console.error('Error fetching appointments:', counselorError.message);
      return res.status(500).send('Internal server error');
    }
    const { data: studentArchiveViewAccounts, error: studentArchiveError } = await supabase
      .from('Student Accounts')
      .select('*')
      .eq('archiveStudent', true)
      .order('email', { ascending: true });

    if (studentArchiveError) {
      console.error('Error fetching appointments:', studentArchiveError.message);
      return res.status(500).send('Internal server error');
    }
    const { data: counselorArchiveViewAccounts, error: counselorArchiveError } = await supabase
      .from('Counselor Accounts')
      .select('*')
      .eq('archiveCounselor', true)
      .order('email', { ascending: true });

    if (counselorArchiveError) {
      console.error('Error fetching appointments:', counselorArchiveError.message);
      return res.status(500).send('Internal server error');
    }
    res.render('adminViewAccounts', { studentViewAccounts, counselorViewAccounts, studentArchiveViewAccounts, counselorArchiveViewAccounts, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/getStudentData/:sEmail', async (req, res) => {
  const sEmail = req.params.sEmail;
  try {
    // Fetch student data from Supabase
    const { data, error } = await supabase
      .from('Student Accounts')
      .select('*')
      .eq('email', sEmail)
      .single();

    if (error) {
      console.error('Error fetching student data:', error);
      return res.status(500).send('Internal server error');
    }
    console.log('Retrieved student data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/getCounselorData/:cEmail', async (req, res) => {
  const cEmail = req.params.cEmail;
  try {
    // Fetch student data from Supabase
    const { data, error } = await supabase
      .from('Counselor Accounts')
      .select('*')
      .eq('email', cEmail)
      .single();

    if (error) {
      console.error('Error fetching counselor data:', error);
      return res.status(500).send('Internal server error');
    }
    console.log('Retrieved counselor data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching counselor data:', error);
    res.status(500).send('Internal server error');
  }
});


myapp.get('/adminEditRoles', async (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  try {
    const { data: editRoles, error1 } = await supabase
      .from('Counselor Accounts')
      .select('email, first_name, last_name')

    if (error1) {
      console.error('Error fetching Counselor Accounts:', error1.message);
      return res.status(500).send('Internal server error');
    }

    const { data: assignedRoles, error2 } = await supabase
      .from('Counselor Role')
      .select('email, department')

    if (error2) {
      console.error('Error fetching Counselor Role:', error2.message);
      return res.status(500).send('Internal server error');
    }

    const { data: counselorPrograms, error3 } = await supabase
      .from('Counselor Program')
      .select('email, program');

    if (error3) {
      console.error('Error fetching Counselor Program:', error3.message);
      return res.status(500).send('Internal server error');
    }

    const counselors = editRoles.map(account => {
      const roles = assignedRoles.filter(role => role.email === account.email);
      const programs = counselorPrograms
        .filter(program => program.email === account.email)
        .map(program => program.program);

      return {
        email: account.email,
        name: `${account.first_name} ${account.last_name}`,
        departments: roles.map(role => role.department),
        programs: programs,
      };
    });

    // Render the 'adminEditRoles' template with counselor details
    res.render('adminEditRoles', { counselors, counselorData });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/getCounselorRoles/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const { data, error } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', email);

    if (error) {
      console.error('Error fetching counselor roles:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

myapp.get('/getCounselorAdminStatus/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const { data, error } = await supabase
      .from('Counselor Accounts')
      .select('admin')
      .eq('email', email);

    if (error) {
      console.error('Error fetching counselor admin status:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Assuming that there's only one record for each counselor email
    const isAdmin = data.length > 0 ? data[0].admin : false;
    res.json(isAdmin);
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

myapp.get('/getAdminCount', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Counselor Accounts')
      .select('*', { count: 'exact' })
      .eq('admin', true);

    if (error) {
      console.error('Error fetching admin count:', error.message);
      return res.status(500).send('Internal server error');
    }

    const adminCount = data.length;

    res.json(adminCount);
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminCounselorLog', async (req, res) => {
  const counselorData = res.locals.counselorData;
  if (!counselorData) {
    // Redirect to the login page if studentData is not present
    res.redirect('/');
    return; // Important: End the request-response cycle to avoid further processing
  }
  try {
    const { data: counselorLog, error } = await supabase
      .from('Report')
      .select('*')
      .order('date_encoded', { ascending: true }, 'time_encoded', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminCounselorLog', { counselorLog, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

//=========POSTING===========//



// REGISTRATION
myapp.post('/register', async (req, res) => {
  const { idNumber, programCode, email, password, lastName, firstName, gender, birthDate, phoneNumber, accountType, departmentSelect } = req.body;

  const uppercaseFirstName = firstName.toUpperCase()
  const uppercaseLastName = lastName.toUpperCase()
  const uppercaseEmail = email.toUpperCase()
  const uppercaseIDNumber = idNumber.toUpperCase()
  const uppercaseGender = gender.toUpperCase()
  const uppercaseAccountType = accountType.toUpperCase()
  const uppercaseProgramCode = programCode.toUpperCase()
  try {
    const emailExists = await supabase
      .from(accountType === 'Student' ? 'Student Accounts' : 'Counselor Accounts')
      .select('email')
      .eq('email', uppercaseEmail)
      .single();

    if (emailExists.data) {
      // Handle the case where the email is already registered
      res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
      return;
    }

    // Register the user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ error: 'Registration failed' });
      return;
    }

    // SEPERATE
    if (accountType === 'Student') {
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Student Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,
            department: departmentSelect,
            progCode: uppercaseProgramCode
          },
        ])
        .single();


      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    } else if (accountType === 'Counselor') {
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Counselor Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,
            admin: 'false'

          },
        ])
        .single();

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    }


    res.status(200).json({ success: 'Registration successful' });


  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

myapp.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  try {
    // Fetch the student data from the specific table
    const { data: studentData, error: studentError } = await supabase
      .from('Student Accounts')
      .select('*')
      .eq('email', email.toUpperCase())
      .single();

    if (studentData) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3030/changePassword',
      })
      return res.status(200).send('Password reset email sent successfully');
    }


    const { data: counselorData, error: counselorError } = await supabase
      .from('Counselor Accounts')
      .select('*')
      .eq('email', email.toUpperCase())
      .single();

    if (counselorData) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3030/changePassword',
      })
      return res.status(200).send('Password reset email sent successfully');
    }

    // If user not found in both student and counselor accounts
    console.error('User data not found');
    return res.status(404).send('User not found');

  } catch (e) {
    console.error('Unexpected error:', e);
    return res.status(500).send('Failed');
  }
});

myapp.post('/changePassword', async (req, res) => {
  try {
      const { newPassword } = req.body;
      const token = req.query.token;

      // Check if user is authenticated
      const {user} = await supabase.auth.getUser(token);
      if (!user) {
          return res.status(401).json({ error: 'User not authenticated' });
      }

      // Reset the user's password using the token
      const { error, data } = await supabase.auth.updateUser({
          password: newPassword
      });

      if (error) {
          console.log(error);
          throw error;
      }

      // Send a JSON response indicating success
      res.status(200).json({ success: 'Password changed successfully' });
  } catch (error) {
      // Send a JSON response indicating the error
      console.error('Failed to change password:', error.message);
      res.status(500).json({ error: `Failed to change password: ${error.message}` });
  }
});

// LOGIN
myapp.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.error('Error logging in:', loginError.message);
      if (loginError.message.includes("Invalid login credentials")) {
        res.status(401).json({ error: 'Incorrect email or password' });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }

      return;
    }

    if (!data || !data.user) {
      console.error('Authentication failed');
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

    // Fetch the student data from the specific table
    const { data: studentData, error: studentError } = await supabase
      .from('Student Accounts')
      .select('*')
      .eq('email', email.toUpperCase())
      .single();

    // Check if the user is a student
    if (studentData) {
      // Store the student data in the session
      res.cookie('userData', data.session.access_token, {
        httpOnly: true
      })

      res
        .status(200)
        .json({ success: 'Login successful', accountType: 'Student' });
      return;

    } else {
      // Fetch the counselor data from the specific table
      const { data: counselorData, error: counselorError } = await supabase
        .from('Counselor Accounts')
        .select('*')
        .eq('email', email.toUpperCase())
        .single();

      // Check if the user is a counselor
      if (counselorData) {
        res.cookie('userData', data.session.access_token, {
          httpOnly: true
        })
        res.status(200).json({ success: 'Login successful', accountType: 'Counselor' });
        return;
      }
      else {
        console.error('User data not found');
        res.status(404).json({ error: 'User not found' });
      }

    }
  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

myapp.post('/updateStudentProfile', async (req, res) => {
  try {
    const { email, phone_number, department, progCode, birth_date } = req.body;
    const upperProgCode = progCode.toUpperCase();
    // Update the Supabase table
    const { data, error } = await supabase
      .from('Student Accounts')
      .update({ phone_number: phone_number, department: department, progCode: upperProgCode, birth_date: birth_date })
      .eq('email', email);

    if (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

myapp.post('/updateCounselorProfile', async (req, res) => {
  try {
    const { email, phone_number, birth_date } = req.body;
    // Update the Supabase table
    const { data, error } = await supabase
      .from('Counselor Accounts')
      .update({ phone_number: phone_number, birth_date: birth_date })
      .eq('email', email);

    if (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

myapp.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      res.clearCookie('userData');
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");


      res.status(200).json({ status: 200, message: 'Logout successful' });
    } else {
      res.status(500).json({ status: 500, message: error.message || 'Logout failed' });
    }
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    res.status(500).json({ status: 500, error: 'Logout failed' });
  }
});

// APPOINTMENT
myapp.post('/create-appointment', async (req, res) => {
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.studentData.email;
    const userFirstName = res.locals.studentData.first_name;
    const userLastName = res.locals.studentData.last_name;
    const department = res.locals.studentData.department;
    const progCode = res.locals.studentData.progCode;
    const appointmentDate = req.body.date;
    const appointmentTime = req.body.time;
    const service = req.body.service;

    // Get the current date and time when the "appoint" button is clicked in the Philippines Time Zone (Asia/Manila)
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    // Format the time in the desired time zone
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);

    // Extract the date component
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: checkPending, error: checkPendingError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('email', userEmail);

    const { data: checkAccepted, error: checkAcceptedError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('email', userEmail);

    const { data: checkResched, error: checkReschedError } = await supabase
      .from('Pending Reschedule')
      .select('*')
      .eq('email', userEmail);

    if (checkPending && checkPending.length > 0) {
      return res.json({ success: false, message: 'You already have a pending appointment.' });
    }

    if (checkAccepted && checkAccepted.length > 0) {
      return res.json({ success: false, message: 'You already have a ongoing appointment.' });
    }

    if (checkResched && checkResched.length > 0) {
      return res.json({ success: false, message: 'You already have a pending reschedule.' });
    }

    const { data: appoint, error } = await supabase
      .from('Pending Appointment')
      .upsert([
        {
          email: userEmail,
          last_name: userLastName,
          first_name: userFirstName,
          date: appointmentDateStr,
          time: appointmentTimeStr,
          department: department,
          notes: service,
          appointed_time: appointmentTime,
          appointed_date: appointmentDate,
          progCode: progCode,
          prog_stat: 'PENDING',
          notif: true
        },
      ]);

    if (error) {
      // Handle the error
      console.error('Error creating appointment:', error.message);
      res.json({ success: false });
    } else {
      // Appointment created successfully
      console.log('Appointment created successfully:', appoint);
      res.json({ success: true });
    }
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.json({ success: false });
  }
});

myapp.post('/studentCancelAppointment/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const cancelledAppointmentData = {
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'CANCELLED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(cancelledAppointmentData);

    if (insertError) {
      console.error('Error inserting cancelled appointment:', insertError.message);
      return res.status(500).send('Failed to cancel the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/feedback/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const ratingValue = req.body.ratingValue;

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Appointment History')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const feedbackData = {
      feedback: ratingValue
    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .update(feedbackData)
      .eq('id', appointmentId);

    if (insertError) {
      console.error('Error inserting feedback appointment:', insertError.message);
      return res.status(500).send('Failed to feedback the appointment');
    }

    res.status(200).json({ message: 'Appointment feedback successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});
//EDIT ROLES
myapp.post('/updateDepartments', async (req, res) => {
  const { email, departments } = req.body;

  try {
    // Fetch existing user departments from the database
    const { data: existingDepartments, error: existingError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', email);

    if (existingError) {
      throw existingError;
    }

    // Extract existing department names from the result
    const existingDepartmentNames = existingDepartments.map(dept => dept.department);

    // Determine departments to delete and insert
    const departmentsToDelete = existingDepartmentNames.filter(dept => !departments.includes(dept));
    const departmentsToInsert = departments.filter(dept => !existingDepartmentNames.includes(dept));

    // Perform deletion and insertion
    await supabase
      .from('Counselor Role')
      .delete()
      .eq('email', email)
      .in('department', departmentsToDelete);

    await supabase
      .from('Counselor Role')
      .insert(
        departmentsToInsert.map(dept => ({ email, department: dept }))
      );

    res.status(200).json({ message: 'Departments updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update departments' });
  }
});

myapp.post('/acceptAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName = counselorData.first_name;
    const counselorLName = counselorData.last_name;
    const appointmentId = req.params.appointmentId;
    const remarks = req.body.remarks;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;
    const progCode = appointmentDetails.progCode;

    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const acceptedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      progCode: progCode,
      prog_stat: 'ACCEPTED',
      remarks: remarks

    };
    // Check for existing appointments with the same counselor email
    const { data: existingAppointments, error: existingAppointmentsError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('counselor_email', counselorEmail);

    if (existingAppointmentsError) {
      console.error('Error fetching existing appointments:', existingAppointmentsError.message);
      return res.status(500).send('Failed to check for existing appointments');
    }

    // Check for time conflicts with existing appointments
    const minimumTimeDifference = 20 * 60 * 1000; // 30 minutes in milliseconds

    const existingAppointmentsUnified = existingAppointments.map(appointment => {
      const startTime = new Date(`${appointment.appointed_date}T${appointment.appointed_time}`);
      const endTime = new Date(startTime.getTime() + minimumTimeDifference);
      return { startTime, endTime };
    });

    const newAppointmentStartTime = new Date(`${appoint_date}T${appoint_time}`);
    const newAppointmentEndTime = new Date(newAppointmentStartTime.getTime() + minimumTimeDifference);

    // Check for time conflicts with existing appointments
    const hasTimeConflict = existingAppointmentsUnified.some(existingAppointment => {
      return (
        (newAppointmentStartTime >= existingAppointment.startTime && newAppointmentStartTime <= existingAppointment.endTime) ||
        (newAppointmentEndTime >= existingAppointment.startTime && newAppointmentEndTime <= existingAppointment.endTime)
      );
    });

    // If there is a time conflict, handle the conflict (e.g., inform the user, reject the new appointment)
    if (hasTimeConflict) {
      console.log('existingAppointmentsUnified:', existingAppointmentsUnified);
      console.log('newAppointmentStartTime:', newAppointmentStartTime);
      console.log('newAppointmentEndTime:', newAppointmentEndTime);
      return res.status(409).json({
        message: 'Appointment conflict: There is already an appointment within the specified time range.',
      });
    }
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Accepted Appointment')
      .insert(acceptedAppointmentData);

    if (insertError) {
      console.error('Error inserting accepted appointment:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment accepted successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/acceptResched/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const remarks = req.body.remarks;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Reschedule')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;
    const progCode = appointmentDetails.progCode;
    const counselor_email = appointmentDetails.counselor_email;
    const counselor_Fname = appointmentDetails.counselor_Fname;
    const counselor_Lname = appointmentDetails.counselor_Lname;

    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const acceptedAppointmentData = {
      counselor_email: counselor_email,
      counselor_Fname: counselor_Fname,
      counselor_Lname: counselor_Lname,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      progCode: progCode,
      prog_stat: 'ACCEPTED',
      remarks: remarks

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Accepted Appointment')
      .insert(acceptedAppointmentData);

    if (insertError) {
      console.error('Error inserting accepted appointment:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Reschedule')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Reschedule accepted successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/reschedAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName = counselorData.first_name;
    const counselorLName = counselorData.last_name;
    const appointmentId = req.params.appointmentId;
    const date = req.body.date;
    const rescheduleTime = req.body.rescheduleTime;
    const rescheduleNotes = req.body.rescheduleNotes;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details!:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const progCode = appointmentDetails.progCode;


    const reschedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: date,
      appointed_time: rescheduleTime,
      progCode: progCode,
      notif: true,
      prog_stat: 'PENDING',
      notes: rescheduleNotes

    };
    // Check for existing appointments with the same counselor email
    const { data: existingAppointments, error: existingAppointmentsError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('counselor_email', counselorEmail);

    if (existingAppointmentsError) {
      console.error('Error fetching existing appointments:', existingAppointmentsError.message);
      return res.status(500).send('Failed to check for existing appointments');
    }

    // Check for time conflicts with existing appointments
    const minimumTimeDifference = 20 * 60 * 1000; // 30 minutes in milliseconds

    const existingAppointmentsUnified = existingAppointments.map(appointment => {
      const startTime = new Date(`${appointment.appointed_date}T${appointment.appointed_time}`);
      const endTime = new Date(startTime.getTime() + minimumTimeDifference);
      return { startTime, endTime };
    });

    const newAppointmentStartTime = new Date(`${date}T${rescheduleTime}`);
    const newAppointmentEndTime = new Date(newAppointmentStartTime.getTime() + minimumTimeDifference);

    // Check for time conflicts with existing appointments
    const hasTimeConflict = existingAppointmentsUnified.some(existingAppointment => {
      return (
        (newAppointmentStartTime >= existingAppointment.startTime && newAppointmentStartTime <= existingAppointment.endTime) ||
        (newAppointmentEndTime >= existingAppointment.startTime && newAppointmentEndTime <= existingAppointment.endTime)
      );
    });

    // If there is a time conflict, handle the conflict (e.g., inform the user, reject the new appointment)
    if (hasTimeConflict) {
      console.log('existingAppointmentsUnified:', existingAppointmentsUnified);
      console.log('newAppointmentStartTime:', newAppointmentStartTime);
      console.log('newAppointmentEndTime:', newAppointmentEndTime);
      return res.status(409).json({
        message: 'Appointment conflict: There is already an appointment within the specified time range.',
      });
    }
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Pending Reschedule')
      .insert(reschedAppointmentData);

    if (insertError) {
      console.error('Error inserting accepted appointment:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Rescheduled successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/completeAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName = counselorData.first_name;
    const counselorLName = counselorData.last_name;
    const appointmentId = req.params.appointmentId;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'completed Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;
    const progCode = appointmentDetails.progCode;


    // Prepare data for 'completed Appointment' with counselor details and adjusted date/time
    const completedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      progCode: progCode,
      prog_status: 'COMPLETED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    // Save accepted appointment in the 'Appointment History' table
    const { data: insertAppointmentHistory, error: insertError1 } = await supabase
      .from('Appointment History')
      .insert(completedAppointmentData);

    if (insertError1) {
      console.error('Error inserting completed appointment:', insertError1.message);
      return res.status(500).send('Failed to complete the appointment');
    }

    // Insert into 'Completed Appointment (No Reports)' table
    const { data: insertCompletedAppointments, error: insertError2 } = await supabase
      .from('Completed Appointment (No Reports)')
      .insert(completedAppointmentData);

    if (insertError2) {
      console.error('Error inserting into Completed Appointment (No Reports):', insertError2.message);
      return res.status(500).send('Failed to complete the appointment');
    }

    // Remove the appointment from 'completed Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Accepted Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error completed appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment completed successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/rejectAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName = counselorData.first_name;
    const counselorLName = counselorData.last_name;
    const appointmentId = req.params.appointmentId;
    const remarks = req.body.remarks;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;
    const progCode = appointmentDetails.progCode;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const rejectedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      progCode: progCode,
      prog_status: 'REJECTED',
      remarks: remarks

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(rejectedAppointmentData);

    if (insertError) {
      console.error('Error inserting rejected appointment:', insertError.message);
      return res.status(500).send('Failed to reject the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment rejected successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/rejectResched/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const remarks = req.body.remarks;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Reschedule')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;
    const progCode = appointmentDetails.progCode;
    const counselor_email = appointmentDetails.counselor_email;
    const counselor_Fname = appointmentDetails.counselor_Fname;
    const counselor_Lname = appointmentDetails.counselor_Lname;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const rejectedAppointmentData = {
      counselor_email: counselor_email,
      counselor_Fname: counselor_Fname,
      counselor_Lname: counselor_Lname,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      progCode: progCode,
      remarks: remarks

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(rejectedAppointmentData);

    if (insertError) {
      console.error('Error inserting rejected appointment:', insertError.message);
      return res.status(500).send('Failed to reject the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Reschedule')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Reschedule rejected successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/cancelAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName = counselorData.first_name;
    const counselorLName = counselorData.last_name;
    const appointmentId = req.params.appointmentId;
    const remarks = req.body.remarks;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;
    const progCode = appointmentDetails.progCode;

    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const cancelledAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      progCode: progCode,
      prog_status: 'CANCELLED',
      remarks: remarks

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(cancelledAppointmentData);

    if (insertError) {
      console.error('Error inserting cancelled appointment:', insertError.message);
      return res.status(500).send('Failed to cancel the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Accepted Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualCounseling', async (req, res) => {
  const { email, fname, lname, department, progcode, concernSelect1, clientSelect1, sessionSelect1, dateInput1, hoursInput1, minutesInput1, noteTextarea1 } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "COUNSELING",
      concern: concernSelect1.toUpperCase(),
      client: clientSelect1.toUpperCase(),
      session: sessionSelect1.toUpperCase(),
      notes: noteTextarea1,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours: hoursInput1,
      minutes: minutesInput1,
      date_appointed: dateInput1

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

//MANUAL REPORT
myapp.post('/submit-manualConsultation', async (req, res) => {
  const { email, fname, lname, department, progcode, consultSelect2, dateInput2, hoursInput2, minutesInput2, noteTextarea2 } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "CONSULTATION",
      category: consultSelect2,
      notes: noteTextarea2,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours: hoursInput2,
      minutes: minutesInput2,
      date_appointed: dateInput2

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualInterview', async (req, res) => {
  const { email, fname, lname, department, progcode, concernSelect3, dateInput3, hoursInput3, minutesInput3, noteTextarea3 } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "INTERVIEW",
      concern: concernSelect3.toUpperCase(),
      notes: noteTextarea3,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours: hoursInput3,
      minutes: minutesInput3,
      date_appointed: dateInput3

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualTesting', async (req, res) => {
  const { email, fname, lname, department, progcode, categType4, concernSelect4, dateInput4, hoursInput4, minutesInput4, noteTextarea4 } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "TESTING",
      category: categType4,
      concern: concernSelect4.toUpperCase(),
      notes: noteTextarea4,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours: hoursInput4,
      minutes: minutesInput4,
      date_appointed: dateInput4

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualOthers', async (req, res) => {
  const { email, fname, lname, department, progcode, concernSelect5, clientSelect5, dateInput5, hoursInput5, minutesInput5, noteTextarea5 } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "OTHERS",
      concern: concernSelect5.toUpperCase(),
      client: clientSelect5.toUpperCase(),
      notes: noteTextarea5,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours: hoursInput5,
      minutes: minutesInput5,
      date_appointed: dateInput5

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

//AUTO REPORT
myapp.post('/submit-counseling', async (req, res) => {
  try {
    const { nameOfConcern, typeOfClient, typeOfSession, hours, minutes, notes, id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "COUNSELING",
      concern: nameOfConcern,
      client: typeOfClient,
      session: typeOfSession,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-consultation', async (req, res) => {
  try {
    const { category, hours, minutes, notes, title, id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "CONSULTATION",
      category: category,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-interview', async (req, res) => {
  try {
    const { nameOfConcern, hours, minutes, notes, title, id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "INTERVIEW",
      concern: nameOfConcern,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-testing', async (req, res) => {
  try {
    const { nameOfConcern, categType, hours, minutes, notes, id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "TESTING",
      concern: nameOfConcern.toUpperCase(),
      category: categType,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-others', async (req, res) => {
  try {
    const { nameOfConcern, typeOfClient, hours, minutes, notes, id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;
    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "OTHERS",
      concern: nameOfConcern,
      client: typeOfClient,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/adminCreateAccount', async (req, res) => {
  const { idNumber, email, lastName, firstName, gender, birthDate, phoneNumber, accountType, departmentSelect } = req.body;
  const uppercaseFirstName = firstName.toUpperCase();
  const uppercaseLastName = lastName.toUpperCase();
  const uppercaseEmail = email.toUpperCase()
  const uppercaseIDNumber = idNumber.toUpperCase()
  const uppercaseGender = gender.toUpperCase()
  const uppercaseAccountType = accountType.toUpperCase()
  try {



    // SEPERATE
    if (accountType === 'Student') {
      // Register the user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'student123'
      });

      if (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Registration failed' });
        return;
      }
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Student Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            password: 'student123',
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,
            department: departmentSelect
          },
        ])
        .single();

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    } else if (accountType === 'Counselor') {
      // Register the user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'counselor123'
      });

      if (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Registration failed' });
        return;
      }
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Counselor Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            password: 'counselor123',
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,
            department: departmentSelect

          },
        ])
        .single();

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    }


    res.status(200).json({ success: 'Registration successful' });


  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

myapp.post('/adminEditStudent', async (req, res) => {
  try {
    const { sEmail, idNumber, programCode, lastName, firstName, gender, departmentSelect } = req.body;

    const uppercaseFirstName = firstName.toUpperCase()
    const uppercaseLastName = lastName.toUpperCase()
    const uppercaseIDNumber = idNumber.toUpperCase()
    const uppercaseGender = gender.toUpperCase()
    const uppercaseProgramCode = programCode.toUpperCase()

    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const updateAccount = {
      first_name: uppercaseFirstName,
      last_name: uppercaseLastName,
      gender: uppercaseGender,
      id_number: uppercaseIDNumber,
      department: departmentSelect,
      progCode: uppercaseProgramCode

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: updateStudentAccount, error: insertError } = await supabase
      .from('Student Accounts')
      .update(updateAccount)
      .eq('email', sEmail);

    if (insertError) {
      console.error('Error updating account:', insertError.message);
      return res.status(500).send('Failed to update the account');
    }

    // Send success response
    res.status(200).json({ message: 'Account updated successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/adminEditCounselor', async (req, res) => {
  try {
    const { cEmail, idNumber, lastName, firstName, gender } = req.body;

    const uppercaseFirstName = firstName.toUpperCase()
    const uppercaseLastName = lastName.toUpperCase()
    const uppercaseIDNumber = idNumber.toUpperCase()
    const uppercaseGender = gender.toUpperCase()

    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const updateAccount = {
      first_name: uppercaseFirstName,
      last_name: uppercaseLastName,
      gender: uppercaseGender,
      id_number: uppercaseIDNumber,

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: updateStudentAccount, error: insertError } = await supabase
      .from('Counselor Accounts')
      .update(updateAccount)
      .eq('email', cEmail);

    if (insertError) {
      console.error('Error updating account:', insertError.message);
      return res.status(500).send('Failed to update the account');
    }

    // Send success response
    res.status(200).json({ message: 'Account updated successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/adminArchiveStudent', async (req, res) => {
  try {
    const { sEmail } = req.body;

    // Update the 'Student Accounts' table to archive the record
    const { data: archiveStudent, error: updateError } = await supabase
      .from('Student Accounts')
      .update({ archiveStudent: true })
      .eq('email', sEmail);

    if (updateError) {
      console.error('Error archiving account:', updateError.message);
      return res.status(500).send('Failed to archive an account');
    }

    // Send success response
    res.status(200).json({ message: 'Student archived successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});


myapp.post('/adminArchiveCounselor', async (req, res) => {
  try {
    const { cEmail } = req.body;

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: archiveCounselor, error: updateError } = await supabase
      .from('Counselor Accounts')
      .update({ archiveCounselor: true })
      .eq('email', cEmail);

    if (updateError) {
      console.error('Error archiving account:', updateError.message);
      return res.status(500).send('Failed to archive the counselor');
    }

    // Send success response
    res.status(200).json({ message: 'Counselor archived successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/adminRetrieveStudent', async (req, res) => {
  try {
    const { sEmail } = req.body;

    // Update the 'Student Accounts' table to archive the record
    const { data: retrieveStudent, error: updateError } = await supabase
      .from('Student Accounts')
      .update({ archiveStudent: false })
      .eq('email', sEmail);

    if (updateError) {
      console.error('Error retrieving account:', updateError.message);
      return res.status(500).send('Failed to retrieve an account');
    }

    // Send success response
    res.status(200).json({ message: 'Student retrieved successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/insertStudentImage', async (req, res) => {
  try {
    const { sEmail, imageUrl } = req.body;

    // Update the 'Student Accounts' table to store the image URL
    const { data, error } = await supabase
      .from('Student Accounts')
      .update({ profile_image: imageUrl })
      .eq('email', sEmail);

    if (error) {
      console.error('Error updating profile:', error.message);
      return res.status(500).send('Failed to update profile');
    }

    // Send success response
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/uploadStudentImage', upload.single('image'), async (req, res) => {
  try {
    const { sEmail } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Upload the image to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('studentImages')
      .upload(`${sEmail}/${file.originalname}`, file.path);

    if (error) {
      console.error('Error uploading profile image:', error.message);
      return res.status(500).send('Failed to upload profile image');
    }

    // Construct the image URL
    const imageUrl = `rvclliowsbnowatrukem/${sEmail}/${file.originalname}`;

    // Update the 'Student Accounts' table to store the image URL
    const { data: updateData, error: updateError } = await supabase
      .from('Student Accounts')
      .update({ profile_image: imageUrl })
      .eq('email', sEmail);

    if (updateError) {
      console.error('Error updating student account:', updateError.message);
      return res.status(500).send('Failed to update student account');
    }

    // Send success response
    res.status(200).json({ message: 'Profile image uploaded and student account updated successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});


myapp.get('/fetchStudentImage', async (req, res) => {
  try {
    const { sEmail } = req.query;

    // Update the 'Student Accounts' table to archive the record
    const { data, error } = await supabase
      .from('Student Accounts')
      .select('profile_image')
      .eq('email', sEmail)
      .single();

    if (error) {
      throw new Error('Failed to fetch student image');
    }

    const profileImageUrl = data.profile_image;
    res.json({ profileImageUrl });
  } catch (error) {
    console.error('Error fetching student image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

myapp.post('/adminRetrieveCounselor', async (req, res) => {
  try {
    const { cEmail } = req.body;

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: retrieveCounselor, error: updateError } = await supabase
      .from('Counselor Accounts')
      .update({ archiveCounselor: false })
      .eq('email', cEmail);

    if (updateError) {
      console.error('Error archiving account:', updateError.message);
      return res.status(500).send('Failed to retrieve the counselor');
    }

    // Send success response
    res.status(200).json({ message: 'Counselor retrieved successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/adminResetStudent', async (req, res) => {
  try {
    const { sEmail } = req.body;

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: resetStudent, error: insertError } = await supabase
      .from('Student Accounts')
      .delete('*')
      .eq('email', sEmail);

    if (insertError) {
      console.error('Error deleting account:', insertError.message);
      return res.status(500).send('Failed to delete the counselor');
    }

    // Send success response
    res.status(200).json({ message: 'Counselor deleted successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/adminEditRoles/update', async (req, res) => {
  try {
    const { counselorEmail, departments, admin, programs } = req.body;

    // Get the existing departments for the counselor
    const { data: existingDepartments, error: existingError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', counselorEmail);

    if (existingError) {
      console.error('Error fetching existing departments:', existingError.message);
      return res.status(500).send('Internal server error');
    }

    const existingDepartmentSet = new Set(existingDepartments.map(entry => entry.department));

    // Identify departments to be deleted
    const departmentsToDelete = existingDepartments
      .filter(entry => !departments.some(selected => selected.department === entry.department))
      .map(entry => entry.department);

    // Delete records for departments to be removed
    const deletePromises = departmentsToDelete.map(async department => {
      const { data, error } = await supabase
        .from('Counselor Role')
        .delete()
        .eq('email', counselorEmail)
        .eq('department', department);

      if (error) {
        console.error('Error deleting counselor role:', error.message);
        return Promise.reject(error.message);
      }

      return data;
    });

    // Insert records for new departments
    const insertPromises = departments
      .filter(selected => !existingDepartmentSet.has(selected.department))
      .map(async selected => {
        const { data, error } = await supabase
          .from('Counselor Role')
          .upsert([
            {
              email: counselorEmail,
              department: selected.department,
            },
          ]);

        if (error) {
          console.error('Error updating counselor role:', error.message);
          return Promise.reject(error.message);
        }

        return data;
      });

    // Wait for all delete and insert operations to complete
    await Promise.all([...deletePromises, ...insertPromises]);

    // Update 'admin' field in 'Counselor Account' table
    const { data: accountData, error: accountError } = await supabase
      .from('Counselor Accounts')
      .update({ admin })
      .eq('email', counselorEmail);

    // Check for errors
    if (accountError) {
      console.error('Error updating counselor account:', accountError.message);
      return res.status(500).send('Internal server error');
    }


    const { data: deleteProgramData, error: deleteProgramError } = await supabase
      .from('Counselor Program')
      .delete()
      .eq('email', counselorEmail);

    // Check for errors
    if (deleteProgramError) {
      console.error('Error deleting existing counselor programs:', deleteProgramError.message);
      return res.status(500).send('Internal server error');
    }

    // Insert records for new programs
    const programInsertPromises = programs.map(async program => {
      const { data, error } = await supabase
        .from('Counselor Program')
        .upsert([
          {
            email: counselorEmail,
            program,
          },
        ]);

      if (error) {
        console.error('Error updating counselor program:', error.message);
        return Promise.reject(error.message);
      }

      return data;
    });

    // Wait for all program insert operations to complete
    await Promise.all(programInsertPromises);

    res.send('Counselor role, account, and program updated successfully!');
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

// Route to handle the adminStatistics form submission
myapp.post('/generate-report', async (req, res) => {
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;

    // Fetch data from 'Appointment History' within the specified date range
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Appointment History')
      .select('*')
      .gte('appointed_date', fromDate)
      .lte('appointed_date', toDate);

    if (appointmentError) {
      throw appointmentError;
    }

    // Fetch data from 'Report' within the specified date range
    const { data: reportData, error: reportError } = await supabase
      .from('Report')
      .select('*')
      .gte('date_encoded', fromDate)
      .lte('date_encoded', toDate);

    if (reportError) {
      throw reportError;
    }

    // Calculate statistics based on 'Appointment History' data
    const appointmentStatistics = calculateStatistics(appointmentData);

    // Calculate statistics based on 'Report' data
    const reportStatistics = calculateReportStatistics(reportData);

    // Send both sets of statistics data as JSON
    res.json({ appointmentStatistics, reportStatistics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function calculateStatistics(data) {
  const statistics = {
    '1st Year': 0,
    '2nd Year': 0,
    '3rd Year': 0,
    '4th Year': 0,
  };

  data.forEach(appointment => {
    const yearLevel = getYearLevelFromProgCode(appointment.progCode);

    if (yearLevel && statistics[yearLevel] !== undefined) {
      statistics[yearLevel]++;
    }
  });

  console.log('Appointment Statistics:', statistics);
  return statistics;
}

function calculateReportStatistics(data) {
  const reportStatistics = {
    'COUNSELING': { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 },
    'CONSULTATION': { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 },
    'INTERVIEW': { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 },
    'TESTING': { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 },
    'OTHERS': { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 },
  };

  data.forEach(report => {
    const yearLevel = getYearLevelFromProgCode(report.progcode);
    const service = report.service;

    if (yearLevel && reportStatistics[service] && reportStatistics[service][yearLevel] !== undefined) {
      reportStatistics[service][yearLevel]++;
    }
  });

  console.log('Report Statistics:', reportStatistics);
  return reportStatistics;
}

function getYearLevelFromProgCode(progCode) {
  const match = progCode ? progCode.match(/\d/) : null;

  if (match) {
    const firstDigit = match[0];

    console.log(`progCode: ${progCode}, firstDigit: ${firstDigit}`);

    switch (firstDigit) {
      case '1':
        return '1st Year';
      case '2':
        return '2nd Year';
      case '3':
        return '3rd Year';
      case '4':
        return '4th Year';
      default:
        return 'Unknown Year';
    }
  }

  return 'Unknown Year';
}

