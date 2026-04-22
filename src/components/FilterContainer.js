import React from "react";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

export default function FilterContainer({ value, onChange }) {
  return (
    <div className="flex flex-row flex-wrap items-start">
      <DateTimePicker
        // className={"text-base"}
        amPmAriaLabel="Select AM/PM"
        calendarAriaLabel="Toggle calendar"
        clearAriaLabel="Clear value"
        dayAriaLabel="Day"
        hourAriaLabel="Hour"
        maxDetail="second"
        minuteAriaLabel="Minute"
        monthAriaLabel="Month"
        nativeInputAriaLabel="Date and time"
        onChange={onChange}
        secondAriaLabel="Second"
        value={value}
        yearAriaLabel="Year"
      />
    </div>
  );
}
