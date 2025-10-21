"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { useRouter } from "next/navigation";
import TimeDisplay from "@/components/time-display";
import { AudioFile } from "@/types/transcription.db";
import { formatDuration, formatFileSize } from "@/lib/utils";
import { FileAudio, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { log } from "@/lib/logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAudio } from "@/components/context/audios-list-context";
import { deleteAudioById, updateAudioName } from "@/lib/query/audio";
import { toast } from "sonner";

type CompactAudioCardProps = {
  audio: AudioFile;
};

/**
 * Render a compact, focusable audio card for the given audio file.
 *
 * Displays the audio name, transcription status, creation time, duration, and file size,
 * and navigates to `?audioId=<id>` when clicked or activated via keyboard.
 *
 * @param audio - The audio file to display (used for title, status, timestamps, duration, and size)
 * @returns A JSX element representing the clickable audio card
 */
export function CompactAudioCard({ audio }: CompactAudioCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const handleClick = () => {
    router.push(`?audioId=${audio.id}`);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRenameDialog(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Card
        className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <FileAudio className="w-4 h-4 text-primary" />
          </div>

          <h3 className="font-medium text-sm text-foreground truncate flex-1 min-w-0">
            {audio.name}
          </h3>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleRename}
            aria-label="Rename audio"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
            onClick={handleDelete}
            aria-label="Delete audio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-start gap-3 pl-0">
          <StatusBadge status={audio.transcription_status} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <TimeDisplay dateString={audio.created_at} />
            <span>{formatDuration(audio.duration)}</span>
            <span>{formatFileSize(audio.file_size)}</span>
          </div>
        </div>
      </Card>
      <ConfirmDeletingDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        audio={audio}
      />
      <RenameInputDialog
        showRenameDialog={showRenameDialog}
        setShowRenameDialog={setShowRenameDialog}
        audio={audio}
      />
    </>
  );
}

/**
 * Render a confirmation dialog for deleting an audio file.
 *
 * On confirmation, the component optimistically removes the audio from the app's audio list, requests backend deletion, and restores the audio while showing an error toast if the request fails.
 *
 * @param showDeleteDialog - Whether the delete confirmation dialog is visible.
 * @param setShowDeleteDialog - Setter to open or close the dialog.
 * @param audio - The audio file to be deleted (used for display and as the deletion target).
 * @returns The AlertDialog UI that prompts for deletion and triggers the delete flow when confirmed.
 */
function ConfirmDeletingDialog({
  showDeleteDialog,
  setShowDeleteDialog,
  audio,
}: {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (arg: boolean) => void;
  audio: AudioFile;
}) {
  const { audios, setAudios } = useAudio();
  async function confirmDelete() {
    const target = audios.find((a) => a.id === audio.id);
    try {
      if (!target) {
        toast.error("There is no audio like that to delete");
        return;
      }
      setAudios((prev) => prev.filter((a) => a.id !== audio.id));
      log.info("Delete audio:", audio.id);
      setShowDeleteDialog(false);
      await deleteAudioById(audio.id);
    } catch (e) {
      if (!target) {
        return;
      }
      setAudios((prev) => [...prev, target]);
      toast.error("Error deleting audio, pls try again");
    }
  }
  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Audio File?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{audio.name}"? This action cannot
            be undone and will permanently remove the audio file and its
            transcription.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Renders a dialog that lets the user rename an audio file and applies an optimistic local update with rollback on error.
 *
 * @param showRenameDialog - Whether the rename dialog is open
 * @param setShowRenameDialog - Setter to open or close the rename dialog
 * @param audio - The audio file being renamed
 * @returns A Dialog element containing an input for the new name and actions to confirm or cancel the rename
 */
function RenameInputDialog({
  showRenameDialog,
  setShowRenameDialog,
  audio,
}: {
  showRenameDialog: boolean;
  setShowRenameDialog: (arg: boolean) => void;
  audio: AudioFile;
}) {
  const { setAudios } = useAudio();
  const [newName, setNewName] = useState(audio.name);

  async function confirmRename() {
    let oldName: string = "";
    try {
      setAudios((prev) =>
        prev.map((a) => {
          if (a.id === audio.id) {
            oldName = a.name;
            return { ...a, name: newName };
          } else {
            return a;
          }
        }),
      );

      log.info("Rename audio:", audio.id, "New name:", newName);
      setShowRenameDialog(false);
      await updateAudioName(audio.id, newName);
    } catch (e) {
      toast.error(`Can not rename the ${audio.name} audio`);
      if (oldName === "") {
        log.error("There some error when selecting the audio, pls try again");
        return;
      }
      setAudios((prev) =>
        prev.map((a) => {
          if (a.id === audio.id) {
            return { ...a, name: oldName };
          } else {
            return a;
          }
        }),
      );
    }
  }
  return (
    <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename Audio File</DialogTitle>
          <DialogDescription>
            Enter a new name for "{audio.name}"
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmRename();
                }
              }}
              placeholder="Enter new name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmRename}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
