import { Button, Header, Link, Text } from "@jamsr-ui/react";
import Orb from "./components/Orb";
import { Logo } from "./components/Logo";

function App() {
  return (
    <div className="w-full h-[700px] z-0 relative">
      <Header>
        <Logo />
        <div className="flex items-center gap-4">
          <Link href="#">Home</Link>
          <Link href="#">Docs</Link>
        </div>
      </Header>

      <Orb
        hoverIntensity={2}
        rotateOnHover={true}
        hue={0}
        forceHoverState={false}
      />

      <div className="absolute top-0 left-0 flex items-center justify-center flex-col w-full h-full z-1 pointer-events-none text-center">
        <Button
          size="md"
          startContent={<img src="/background.svg" height={15} width={15} />}
          variant="outlined"
          className="text-foreground"
        >
          New Background
        </Button>
        <Text as="h1" variant="h1" className="text-5xl mt-4 max-w-[18ch]">
          This orb is hiding something, try hovering!
        </Text>
        <div className="flex items-center gap-4 mt-8">
          <Button>Get Started</Button>
          <Button variant="outlined">Learn More</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
