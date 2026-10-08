import { render, screen } from "@testing-library/react";
import PlayerCard from "./PlayerCard";

const player = {
  name: "Axar Patel",
  role: "Allrounder",
  nationality: "India",
  img: "https://upload.wikimedia.org/wikipedia/commons/4/49/Axar_Patel.jpg",
  imageCredit: "Dee03",
  imageLicense: "CC BY-SA 4.0",
  imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  imageSource: "https://commons.wikimedia.org/wiki/File:Axar_Patel.jpg",
};

test("shows the player portrait with a visible source and license credit", () => {
  render(
    <PlayerCard
      currentPlayer={player}
      currentBid={100}
      currentLeader="No one yet"
      placeBid={jest.fn()}
      isTeamSet={false}
      isWinning={false}
      timer={10}
      isPaused={false}
    />,
  );

  expect(screen.getByAltText("Axar Patel")).toHaveAttribute("src", player.img);
  const sourceCredit = screen.getByRole("link", { name: /photo source and credit: Dee03/i });
  expect(sourceCredit).toHaveAttribute("href", player.imageSource);
  expect(sourceCredit).toHaveAttribute("target", "_blank");
  expect(screen.getByRole("link", { name: "Image license: CC BY-SA 4.0" })).toHaveAttribute("href", player.imageLicenseUrl);
});
