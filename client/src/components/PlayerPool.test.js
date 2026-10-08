import { render, screen } from "@testing-library/react";
import PlayerPool from "./PlayerPool";

const player = {
  name: "Axar Patel",
  role: "Allrounder",
  basePrice: 100,
  img: "https://upload.wikimedia.org/wikipedia/commons/4/49/Axar_Patel.jpg",
  imageCredit: "Dee03",
  imageLicense: "CC BY-SA 4.0",
  imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  imageSource: "https://commons.wikimedia.org/wiki/File:Axar_Patel.jpg",
};

test("shows a licensed player image and a linked photo credit in the pool", () => {
  const { container } = render(<PlayerPool playersList={[player]} currentPlayer={player} />);

  expect(container.querySelector(".pool-player-card img")).toHaveAttribute("src", player.img);
  expect(screen.getByRole("link", { name: /photo source and credit for Axar Patel: Dee03/i })).toHaveAttribute("href", player.imageSource);
  expect(screen.getByRole("link", { name: "Image license for Axar Patel: CC BY-SA 4.0" })).toHaveAttribute("href", player.imageLicenseUrl);
});
