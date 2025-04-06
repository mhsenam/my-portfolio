"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Import specific icons from react-icons
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

export function ContactPopover() {
  // Use actual Telegram and WhatsApp links
  const telegramLink = "https://t.me/mhsenam";
  const whatsappLink = "https://wa.me/+989155656532";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="lg" className="text-lg mt-4 cursor-pointer">
          Get In Touch
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-background/80 backdrop-blur-md border-border">
        <div className="flex flex-col space-y-2">
          <Link href={telegramLink} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className="w-full justify-start cursor-pointer"
            >
              {/* Use Telegram icon */}
              <FaTelegramPlane className="mr-2 h-5 w-5" />
              Telegram
            </Button>
          </Link>
          <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className="w-full justify-start cursor-pointer"
            >
              {/* Use WhatsApp icon */}
              <FaWhatsapp className="mr-2 h-5 w-5" />
              WhatsApp
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
