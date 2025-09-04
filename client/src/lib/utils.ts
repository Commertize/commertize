import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Navigate to home and scroll to section
export const navigateToHomeSection = (setLocation: (path: string) => void, sectionId: string) => {
  // First, navigate to home
  setLocation('/');

  // Then scroll to section after a small delay to ensure the component is mounted
  setTimeout(() => {
    scrollToSection(sectionId);
  }, 100);
};