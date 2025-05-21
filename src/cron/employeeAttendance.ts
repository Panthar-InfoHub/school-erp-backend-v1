import cron from "node-cron";
import Employee from "../models/employee";
import EmployeeAttendance from "../models/employeeAttendance";
import generateUUID from "../utils/uuidGenerator";

export function startAttendanceScheduler() {
    console.log('Initializing attendance scheduler...'); // Changed from logger to console.log

    cron.schedule('*/10 * * * *', async () => {
        const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        console.log('Running scheduled attendance check at:', istDate); // Changed from logger to console.log

        try {
            // Get all active and not fired employees
            const employees = await Employee.findAll({
                where: {
                    isActive: true,
                    isFired: false
                }
            });

            console.log('Found employees:', employees.length); // Added debug log

            if (employees.length === 0) {
                console.log('No active employees found');
                return;
            }

            const currentDate = new Date(istDate);
            currentDate.setHours(0, 0, 0, 0);
            
            console.log('Checking attendance for date:', currentDate); // Added debug log
            
            const isSunday = currentDate.getDay() === 0;
            for (const employee of employees) {
                try {
                    const existingAttendance = await EmployeeAttendance.findOne({
                        where: {
                            employeeId: employee.id,
                            date: currentDate
                        }
                    });

                    if (!existingAttendance) {
                        console.log('Creating attendance for employee:', employee.id); // Added debug log
                        
                        const newAttendance = await EmployeeAttendance.create({
                            attendanceId: `att_${generateUUID()}`,
                            employeeId: employee.id,
                            date: currentDate,
                            isPresent: false,
                            isHoliday: isSunday,
                            isLeave: false,
                            isInvalid: false,
                            clockInTime: null
                        });

                        console.log(
                            'Created attendance entry:',
                            newAttendance.attendanceId,
                            'for employee:',
                            employee.id
                        );
                    } else {
                        console.log('Attendance already exists for employee:', employee.id); // Added debug log
                    }
                } catch (error) {
                    console.error(
                        'Error processing employee:',
                        employee.id,
                        'Error:',
                        error
                    );
                }
            }

            console.log('Completed scheduled attendance check');
        } catch (error) {
            console.error('Error in scheduled attendance check:', error);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata'
    });

    console.log('Attendance scheduler initialized successfully');
}