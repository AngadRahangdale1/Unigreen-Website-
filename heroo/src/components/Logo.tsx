import { Text } from "@jamsr-ui/react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.jpg" alt="logo" className="size-8 rounded-full" />
      <Text variant="h5" className="font-normal">
        Ainums Code
      </Text>
    </div>
  );
};
