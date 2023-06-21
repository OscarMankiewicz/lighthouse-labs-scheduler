export function getAppointmentsForDay(state, day) {
    const selectedDay = state.days.find(d => d.name === day);
    
    if (!selectedDay) {
      return [];
    }
    
    return selectedDay.appointments.map(appointmentId => state.appointments[appointmentId]);
}

export function getInterview(state, interview) {
    if (!interview) {
      return null;
    }
  
    const { student, interviewer } = interview;
  
    return {
      student,
      interviewer: state.interviewers[interviewer]
    };
}
  
export function getInterviewersForDay(state, day) {
    const selectedDay = state.days.find(d => d.name === day);
  
    if (!selectedDay || !selectedDay.interviewers) {
      return [];
    }
  
    return selectedDay.interviewers.map(interviewerId => state.interviewers[interviewerId]);
}
  