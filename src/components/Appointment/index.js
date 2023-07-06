import React from "react";
import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from './Form';
import Status from "./Status";
import Confirm from "./Confirm";
import Error from "./Error";
import "components/Appointment/styles.scss";
import useVisualMode from '../../hooks/useVisualMode';

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const DELETING = "DELETING";
const CONFIRM = "CONFIRM";
const EDIT = "EDIT";
const SAVING = "SAVING";
const ERROR_SAVE = "ERROR_SAVE";
const ERROR_EDIT = "ERROR_EDIT";
const ERROR_DELETE = "ERROR_DELETE";

export default function Appointment(props) {
    const { mode, transition, back} = useVisualMode(props.interview ? SHOW : EMPTY);

    const handleAddAppointment = () => {
      transition(CREATE);
    };

    function save(name, interviewer) {
        console.log(name, interviewer)
        const interview = {
          student: name,
          interviewer
        };

        transition(SAVING);

        props
        .bookInterview(props.id, interview)
        .then(() => transition(SHOW))
        .catch((error) => {
            transition(ERROR_EDIT, true);
        })
    };

    function deleteAppointment() {
        transition(CONFIRM);
    }

    function confirmDelete() {
        transition(DELETING, true);
        props.cancelInterview(props.id)
        .then(() => transition(EMPTY))
        .catch(() => transition(ERROR_DELETE, true));
    };
    

    function editAppointment() {
        transition(EDIT)
    }

    function handleErrorClose() {
        transition(SHOW)
    }

    function handleErrorSave() {
        transition(EMPTY)
    }

    return (
      <article className="appointment" data-testid="appointment">
        <Header time={props.time} />
        {mode === EMPTY && <Empty onAdd={handleAddAppointment} />}
        {mode === SHOW && (
            <Show
                student={props.interview?.student}
                interviewer={props.interview?.interviewer}
                deleteAppointment={deleteAppointment}
                onEdit={editAppointment}
            />
        )}
        {mode === EDIT && (
            <Form 
                interviewers={props.interviewers}
                onSave={save} 
                onCancel={back}
                student={props.interview?.student} 
                interviewer={props.interview?.interviewer.id} 
            />
        )}
        {mode === CREATE && <Form interviewers={props.interviewers} onSave={save} cancel={back}/>}
        {mode === DELETING && <Status message="Deleting" />}
        {mode === CONFIRM && <Confirm message="Are you sure you would like to Delete?" onConfirm={confirmDelete} onCancel={back}/>}
        {mode === SAVING && <Status message="Saving" />}
        {mode === ERROR_SAVE && <Error message="Failed to save appointment" onClose={handleErrorSave}/>}
        {mode === ERROR_EDIT && <Error message="Failed to edit appointment" onClose={handleErrorClose}/>}
        {mode === ERROR_DELETE && <Error message="Failed to cancel appointment" onClose={handleErrorClose}/>}
      </article>
    );
}
