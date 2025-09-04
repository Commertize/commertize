import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  cityStateZip: z.string().min(1, "City, State, and ZIP are required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
});

interface ConfidentialityAgreementProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

export function ConfidentialityAgreement({
  onSubmit,
  onCancel,
}: ConfidentialityAgreementProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      address: "",
      cityStateZip: "",
      phone: "",
      email: "",
      name: "",
      title: "",
    },
  });

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h2>Commertize Corp - State of Delaware</h2>

        <p>
          Commertize Corp (referred to as "Commertize") has been exclusively engaged by the "Owner" regarding 
          the offering of the "Core Property Fund" (the "Properties"). The Owner mandates that all inquiries 
          and communications related to the potential sale of these Properties must be directed exclusively to 
          Commertize.
        </p>

        <h3>Ownership and Use of Informational Materials:</h3>
        <p>
          All Informational Materials provided by Commertize remain the property of the Owner and Commertize. 
          These materials are for the sole use of the Potential Purchaser and may not be copied, duplicated, 
          or shared without written consent from Commertize.
        </p>

        <h3>Confidentiality:</h3>
        <p>
          The Informational Materials must be treated as confidential and may only be disclosed to the 
          Potential Purchaser's partners, employees, legal counsel, or institutional lenders ("Related Parties") 
          for purposes directly related to evaluating the Properties.
        </p>

        <h3>Accuracy and Representation:</h3>
        <p>
          The Potential Purchaser acknowledges that Commertize and the Owner do not guarantee the accuracy 
          or completeness of the Informational Materials. These materials are based on data provided to 
          Commertize by third parties and have not been independently verified.
        </p>

        <h3>Property Sale Conditions:</h3>
        <p>
          The Potential Purchaser acknowledges that the Properties may be withdrawn from the market or sold 
          to another party without prior notice for any reason. The Properties are offered without discrimination 
          based on race, creed, sex, religion, or national origin.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cityStateZip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City, State, ZIP</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Accept Agreement</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}