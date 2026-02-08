'use server';

/**
 * @fileOverview Generates a dynamic EMI overlay message using generative AI, tailored to the specific device, shop, and owner details.
 *
 * - generateEmiOverlayMessage - A function that generates the EMI overlay message.
 * - GenerateEmiOverlayMessageInput - The input type for the generateEmiOverlayMessage function.
 * - GenerateEmiOverlayMessageOutput - The return type for the generateEmiOverlayMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmiOverlayMessageInputSchema = z.object({
  deviceName: z.string().describe('The name of the device.'),
  shopName: z.string().describe('The name of the shop.'),
  ownerName: z.string().describe('The name of the shop owner.'),
  emiAmount: z.number().describe('The amount of EMI due.'),
  dueDate: z.string().describe('The due date of the EMI.'),
});
export type GenerateEmiOverlayMessageInput = z.infer<typeof GenerateEmiOverlayMessageInputSchema>;

const GenerateEmiOverlayMessageOutputSchema = z.object({
  overlayMessage: z.string().describe('The generated overlay message.'),
});
export type GenerateEmiOverlayMessageOutput = z.infer<typeof GenerateEmiOverlayMessageOutputSchema>;

export async function generateEmiOverlayMessage(input: GenerateEmiOverlayMessageInput): Promise<GenerateEmiOverlayMessageOutput> {
  return generateEmiOverlayMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmiOverlayMessagePrompt',
  input: {schema: GenerateEmiOverlayMessageInputSchema},
  output: {schema: GenerateEmiOverlayMessageOutputSchema},
  prompt: `You are an expert at crafting user-friendly and informative messages for mobile devices with outstanding EMIs.  Your goal is to clearly communicate that an EMI is due and encourage prompt payment.

  Using the following details, create a concise and compelling overlay message:

  Device: {{{deviceName}}}
  Shop: {{{shopName}}} (Owner: {{{ownerName}}})
  EMI Amount: {{{emiAmount}}}
  Due Date: {{{dueDate}}}

  The message should be no more than 50 words. It should include a call to action, such as "Pay at Shop" or "Contact your shop". Be professional, informative, and encouraging.

  Overlay Message:`, // Ensure output is assigned to "overlayMessage"
});

const generateEmiOverlayMessageFlow = ai.defineFlow(
  {
    name: 'generateEmiOverlayMessageFlow',
    inputSchema: GenerateEmiOverlayMessageInputSchema,
    outputSchema: GenerateEmiOverlayMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
