import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaidLinkProps {
  userId: string;
  onSuccess?: (publicToken: string, metadata: any) => void;
  onExit?: (err: any, metadata: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function PlaidLink({
  userId,
  onSuccess,
  onExit,
  className,
  children
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Create link token when component mounts
  useEffect(() => {
    const createLinkToken = async () => {
      if (!userId) {
        console.error('User ID is required for Plaid Link');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId
          }),
        });

        const data = await response.json();
        
        if (data.success && data.link_token) {
          setLinkToken(data.link_token);
        } else {
          console.error('Failed to create link token:', data.error);
          toast({
            title: "Connection Error",
            description: "Failed to initialize bank connection. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error creating link token:', error);
        toast({
          title: "Connection Error", 
          description: "Failed to initialize bank connection. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createLinkToken();
  }, [userId, toast]);

  // Handle successful Link flow
  const handleOnSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        // Exchange public token for access token
        const response = await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_token: publicToken,
            userId: userId,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // Get identity information for KYC verification
          const identityResponse = await fetch('/api/plaid/identity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: data.access_token,
            }),
          });

          const identityData = await identityResponse.json();
          
          toast({
            title: "Account Connected & Verified",
            description: "Your bank account has been successfully connected and identity verified.",
          });
          
          // Call parent success handler with both access token and identity data
          if (onSuccess) {
            onSuccess(publicToken, {
              ...metadata,
              access_token: data.access_token,
              item_id: data.item_id,
              identity_data: identityData.success ? identityData.accounts : null
            });
          }
        } else {
          console.error('Failed to exchange public token:', data.error);
          toast({
            title: "Connection Failed",
            description: "Failed to complete bank account connection. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error exchanging public token:', error);
        toast({
          title: "Connection Failed",
          description: "Failed to complete bank account connection. Please try again.",
          variant: "destructive",
        });
      }
    },
    [onSuccess, toast]
  );

  // Handle Link exit/error
  const handleOnExit = useCallback(
    (err: any, metadata: any) => {
      if (err != null) {
        console.error('Plaid Link error:', err);
        toast({
          title: "Connection Cancelled",
          description: "Bank account connection was cancelled or encountered an error.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Cancelled", 
          description: "Bank account connection was cancelled.",
        });
      }
      
      // Call parent exit handler if provided
      if (onExit) {
        onExit(err, metadata);
      }
    },
    [onExit, toast]
  );

  // Initialize Plaid Link with redirect mode
  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
    onEvent: (eventName: string, metadata: any) => {
      // Optional: Log Link events for debugging
      console.log('Plaid Link event:', eventName, metadata);
    },
    // Force redirect mode to open in new page
    receivedRedirectUri: window.location.href,
  };

  const { open, ready } = usePlaidLink(config);

  // Handle button click - redirect to Plaid in new page
  const handleClick = () => {
    if (ready && linkToken) {
      // Create Plaid Link URL for redirect mode
      const plaidRedirectUrl = `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=false&token=${linkToken}&redirect_uri=${encodeURIComponent(window.location.href)}`;
      
      // Open Plaid in new window/tab
      window.open(plaidRedirectUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    }
  };

  if (isLoading || !linkToken) {
    return (
      <Button disabled className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Initializing...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!ready || !linkToken}
      className={className}
    >
      {children || (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Bank Account
        </>
      )}
    </Button>
  );
}