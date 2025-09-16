import { useState } from "react";
import { Post } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

interface MarkFoundModalProps {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (secret: string) => void;
  isPending?: boolean;
  action?: "found" | "returned";
}

export function MarkFoundModal({ post, open, onClose, onConfirm, isPending, action = "found" }: MarkFoundModalProps) {
  const [secret, setSecret] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) {
      onConfirm(secret);
      setSecret("");
    }
  };

  const handleClose = () => {
    setSecret("");
    onClose();
  };

  const isReturned = action === "returned";
  const title = isReturned ? "Mark as Returned to Owner" : "Mark as Found";
  const description = isReturned 
    ? `To mark "${post?.title}" as returned to its owner, please enter the secret password that was set when the item was reported found.`
    : `To mark "${post?.title}" as found, please enter the secret password that was set when the item was reported lost.`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-mark-found">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-chart-2" />
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="secret" className="text-sm">Secret Password</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Enter the secret password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                disabled={isPending}
                data-testid="input-secret"
                className="text-sm"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!secret.trim() || isPending}
              data-testid="button-confirm"
            >
              {isPending ? "Verifying..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
