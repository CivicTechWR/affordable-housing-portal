import { render, screen } from "@testing-library/react";
import { DatePicker } from "../date-picker";
import "@testing-library/jest-dom";

it("Displays Formatted Text", () => {
  // arrange
  const expected = "foodbar";

  // act
  render(<DatePicker formattedText={expected} onSelect={() => {}} />);

  // assert
  const actual = screen.getByText(expected);
  expect(actual).toBeInTheDocument();
});
