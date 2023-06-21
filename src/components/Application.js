import React, { useState, useEffect } from "react";
import axios from "axios";
import "components/Application.scss";
import DayList from "./DayList";
import Appointment from "./Appointment";
import { getAppointmentsForDay, getInterview, getInterviewersForDay} from "../helpers/selectors";

export default function Application(props) {
    const setDay = (day) => setState({ ...state, day });
  
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
    
    const appointments = getAppointmentsForDay(state, day);
    const interviewers = getInterviewersForDay(state, day);

    const schedule = appointments.map((appointment) => {
        const interview = getInterview(state, appointment.interview);

        return (
            <Appointment
              key={appointment.id}
              id={appointment.id}
              time={appointment.time}
              interview={interview}
              interviewers={interviewers}
            />
        );
    });
      
  return (
    <main className="layout">
      <section className="sidebar">
        <img
            className="sidebar--centered"
            src="images/logo.png"
            alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
            <DayList
                days={state.days}
                value={state.day}
                onChange={setDay}
            />
        </nav>
        <img
            className="sidebar__lhl sidebar--centered"
            src="images/lhl.png"
            alt="Lighthouse Labs"
        />
      </section>
      <section className="schedule">
            {schedule}
            < Appointment key="last" time="5pm" />
        </section>
    </main>
  );
}