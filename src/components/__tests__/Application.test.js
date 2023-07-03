import React from "react";
import { render, cleanup, waitForElement, fireEvent, queryByText, getByText, getAllByTestId, getByAltText, getByPlaceholderText, queryByAltText} from "@testing-library/react";
import Application from "components/Application";
import axios from "axios";

afterEach(cleanup);

describe("Application", () => {
    it("changes the schedule when a new day is selected", async () => {
        const { getByText } = render(<Application />);
      
        await waitForElement(() => getByText("Monday"));
      
        fireEvent.click(getByText("Tuesday"));
      
        expect(getByText("Leopold Silvers")).toBeInTheDocument();
    });
    
    it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
        const { container, debug } = render(<Application />);

        await waitForElement(() => getByText(container, "Archie Cohen"));

        const appointments = getAllByTestId(container, "appointment");

        const appointment = appointments[0];

        fireEvent.click(getByAltText(appointment, "Add"));

        fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
            target: { value: "Lydia Miller-Jones" }
        });
        fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
        fireEvent.click(getByText(appointment, "Save"));

        expect(getByText(appointment, "Saving")).toBeInTheDocument();

        await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));

        const day = getAllByTestId(container, "day").find(day =>
            queryByText(day, "Monday")
        );

        expect (getByText(day, "no spots remaining")).toBeInTheDocument()
        debug();
    });

    it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
        // 1. Render the Application.
        const { container, debug } = render(<Application />);
        // 2. Wait until the text "Archie Cohen" is displayed.
        await waitForElement(() => getByText(container, "Archie Cohen"));
        // 3. Click the "Delete" button on the booked appointment.
        const appointment = getAllByTestId(container, "appointment").find(
            appointment => queryByText(appointment, "Archie Cohen")
          );
        
        fireEvent.click(queryByAltText(appointment, "Delete"));
        // 4. Check that the confirmation message is shown.
        expect(
            getByText(appointment, "Are you sure you would like to Delete?")
        ).toBeInTheDocument()
        // 5. Click the "Confirm" button on the confirmation.
        fireEvent.click(queryByText(appointment, "Confirm"));
        // 6. Check that the element with the text "Deleting" is displayed.
        expect(getByText(appointment, "Deleting")).toBeInTheDocument();
        // 7. Wait until the element with the "Add" button is displayed.
        await waitForElement(() => getByAltText(appointment, "Add"));
        // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
        const day = getAllByTestId(container, "day").find(day => 
            queryByText(day, "Monday")
        );
        expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
        debug();
    });

    it("loads data, edits an interview and keeps the remaing for Monday the same", async() => {
        // 1. Render the Application.
        const { container, debug } = render(<Application />);
        // 2. Wait until the text "Archie Cohen is displayed".
        await waitForElement(() => getByText(container, "Archie Cohen"));
        // 3. Click the "Edit" button on the booked appointment.
        const appointment = getAllByTestId(container, "appointment").find(
            appointment => queryByText(appointment, "Archie Cohen")
        );
        fireEvent.click(queryByAltText(appointment, "Edit"));
        // 4. Check that the element with the text "Enter student name" is displayed.
        expect(getByPlaceholderText(appointment, "Enter Student Name")).toBeInTheDocument();
        // 5. Change student name and select a new interviewer.
        const input = getByPlaceholderText(appointment, "Enter Student Name");
        fireEvent.change(input, { target: { value: "New Student Name"}});

        const interviewer = getByAltText(appointment, "Sylvia Palmer");
        fireEvent.click(interviewer);

        fireEvent.click(queryByText(appointment, "Save"));
        // 6. Check that the element with the text "Saving" is displayed.
        expect(getByText(appointment, "Saving")).toBeInTheDocument();
        await waitForElement(() => queryByText (appointment, "Saving"))
        // 7. Check that the DayListItem with the text "Monday" also has the text "1 spot remaining".
        const day = getAllByTestId(container, "day").find(day => 
            queryByText(day, "Monday")
        );
        expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
        debug();
    })

    it("shows the save error when failing to save an appointment", async() => {
        // 1. Render the Application.
        axios.put.mockRejectedValueOnce();
        const { container, debug } = render(<Application />);
        // 2. Wait until the text "Arche Cohen" is displayed.
        await waitForElement(() => getByText(container, "Archie Cohen"));

        const appointments = getAllByTestId(container, "appointment");
        const appointment = appointments[0];
        // 3. Click the Add button on the second Appointment
        fireEvent.click(getByAltText(appointment, "Add"));
        fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
            target: { value: "Lydia Miller-Jones" }
        });

        const interviewer = getByAltText(appointment, "Sylvia Palmer");
        fireEvent.click(interviewer);

        fireEvent.click(getByText(appointment, "Save"))
        // 4. Check that the element with the text "Saving" is displayed
        expect(getByText(appointment, "Saving")).toBeInTheDocument();

        // 5. Wait for the element with the text "Failed to save appointment" is displayed.
        await waitForElement(() => getByText(appointment, "Failed to save appointment"));
        expect(getByText(appointment, "Failed to save appointment")).toBeInTheDocument();
        debug();
    });

    it("shows the delete error when failinh to delete an existing appointment", async() => {
        // 1. Render the Application.
        axios.delete.mockRejectedValueOnce();
        const { container, debug } = render(<Application />);
        // 2. Wait until the text "Archie Cohen" is displayed.
        await waitForElement(() => getByText(container, "Archie Cohen"));
        // 3. Click the "Delete" button on the booked appointment.
        const appointment = getAllByTestId(container, "appointment").find(
            appointment => queryByText(appointment, "Archie Cohen")
          );
        
        fireEvent.click(queryByAltText(appointment, "Delete"));
        // 4. Check that the confirmation message is shown.
        expect(
            getByText(appointment, "Are you sure you would like to Delete?")
        ).toBeInTheDocument()
        // 5. Click the "Confirm" button on the confirmation.
        fireEvent.click(queryByText(appointment, "Confirm"));
        // 6. Check that the element with the text "Deleting" is displayed.
        expect(getByText(appointment, "Deleting")).toBeInTheDocument();
        // 7. Check that the element with the text "Failed to cancel appointment" is displayed.
        await waitForElement(() => getByText(appointment, "Failed to cancel appointment"));
        expect(getByText(appointment, "Failed to cancel appointment")).toBeInTheDocument();
        debug();
    })
})