import { useState, useEffect } from "react";
import axios from "axios";
import { getAppointmentsForDay, getInterviewersForDay } from "../helpers/selectors";
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8001/api",
  });
  

export default function useApplicationData() {
    const [state, setState] = useState({
        day: "Monday",
        days: [],
        appointments: {},
        interviewers: {},
    });

    useEffect(() => {
        Promise.all([
            api.get("/days"),
            api.get("/appointments"),
            api.get("/interviewers")
          ])
            .then((all) => {
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
        return api.put(`/appointments/${id}`, { interview })
          .then((response) => {
            const appointment = {
              ...state.appointments[id],
              interview: { ...interview },
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
        return api.delete(`/appointments/${id}`)
          .then(() => {
            const appointment = {
              ...state.appointments[id],
              interview: null
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