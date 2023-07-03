import { useState, useEffect } from "react";
import axios from "axios";
import { getAppointmentsForDay, getInterviewersForDay } from "../helpers/selectors";

export default function useApplicationData() {
    const [state, setState] = useState({
        day: "Monday",
        days: [],
        appointments: {},
        interviewers: {},
    });

    useEffect(() => {
        Promise.all([
            axios.get("http://localhost:8001/api/days"),
            axios.get("http://localhost:8001/api/appointments"),
            axios.get("http://localhost:8001/api/interviewers")
          ])
            .then((all) => {
              console.log("All responses:", all);
              console.log("Days response:", all[0].data);
              console.log("Appointments response:", all[1].data);
              console.log("Interviewers Data", all[2].data)
              setState((prev) => ({
                ...prev,
                days: all[0].data,
                appointments: all[1].data,
                interviewers: all[2].data
              }));
            })
        .catch((error) => console.log(error));
    }, []);

    const {day} = state;
    
    const appointments = getAppointmentsForDay(state, state.day);
    const interviewers = getInterviewersForDay(state, day);

    function updateSpots(dayName, days, appointments) {
        const dayAppointments = getAppointmentsForDay({...state, appointments}, dayName);
        const interviewers = getInterviewersForDay({...state, appointments}, dayName);

        const spots = dayAppointments.reduce((count, appointment) => {
            if (!appointment.interview) {
              return count + 1;
            }
            return count;
        }, 0);

        const updatedDays = days.map((day) => {
            if (day.name === dayName) {
              return { ...day, spots };
            }
            return day;
        });
        
        return updatedDays;
    }

    function bookInterview(id, interview) {
        return axios.put(`http://localhost:8001/api/appointments/${id}`, { interview })
          .then((response) => {
            const appointment = {
              ...state.appointments[id],
              interview: { ...interview },
            };
      
            const appointments = {
              ...state.appointments,
              [id]: appointment,
            };
      
            setState((prev) => {
                const appointments = {
                  ...prev.appointments,
                  [id]: appointment,
                };
            
                const days = updateSpots(prev.day, prev.days, appointments);
            
                return {
                  ...prev,
                  appointments,
                  days,
                };
            });
        })  
    }
      

    function cancelInterview(id) {
        return axios.delete(`http://localhost:8001/api/appointments/${id}`)
          .then(() => {
            const appointment = {
              ...state.appointments[id],
              interview: null
            };
      
            const appointments = {
              ...state.appointments,
              [id]: appointment
            };
      
            setState((prev) => {
                const appointments = {
                  ...prev.appointments,
                  [id]: appointment,
                };
            
                const days = updateSpots(prev.day, prev.days, appointments);
            
                return {
                  ...prev,
                  appointments,
                  days,
                };
              });
        });
    }

    return{
        state,
        setDay: (day) => setState((prev) => ({ ...prev, day })),
        bookInterview,
        cancelInterview,
        appointments,
        interviewers,
    };
}