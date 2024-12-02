/**
 * Service for interacting with Reddit's comment box
 */

interface LexicalNode {
  __type: string;
  __text?: string;
  __children?: LexicalNode[];
}

/**
 * Creates a Lexical node structure for the comment text
 */
function createLexicalNodes(text: string): LexicalNode {
  return {
    __type: "root",
    __children: [
      {
        __type: "paragraph",
        __children: [
          {
            __type: "text",
            __text: text
          }
        ]
      }
    ]
  };
}

/**
 * Set text content in Reddit's comment box and trigger internal updates
 */
export async function setCommentText(text: string): Promise<void> {
  try {
    // Find the shreddit-composer element
    const composer = document.querySelector('shreddit-composer') as HTMLElement;
    if (!composer) {
      throw new Error('Comment composer not found');
    }

    // Get the Lexical editor div
    const editor = composer.querySelector('[data-lexical-editor="true"]') as HTMLDivElement;
    if (!editor) {
      throw new Error('Lexical editor not found');
    }

    // Create text node structure
    const nodes = createLexicalNodes(text);

    // Set the editor content
    const p = document.createElement('p');
    p.className = 'first:mt-0 last:mb-0';
    p.textContent = text;
    editor.innerHTML = '';
    editor.appendChild(p);

    // Focus the editor
    editor.focus();

    // Dispatch necessary events to update internal state
    const events = ['input', 'change', 'blur', 'focus'];
    events.forEach(eventType => {
      editor.dispatchEvent(new Event(eventType, { bubbles: true }));
    });

    // Wait a bit for React state to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find the comment button and ensure it's enabled
    const commentButton = composer.querySelector('[type="submit"]') as HTMLButtonElement;
    if (commentButton) {
      commentButton.disabled = false;
    }

  } catch (error) {
    console.error('Failed to set comment text:', error);
    throw error;
  }
}

/**
 * Submit the comment by clicking the Comment button
 */
export async function submitComment(): Promise<void> {
  try {
    // Find the Comment button
    const commentButton = document.querySelector('shreddit-composer [type="submit"]') as HTMLButtonElement;
    if (!commentButton) {
      throw new Error('Comment button not found');
    }

    // Ensure button is enabled
    if (commentButton.disabled) {
      throw new Error('Comment button is disabled');
    }

    // Click the button
    commentButton.click();

  } catch (error) {
    console.error('Failed to submit comment:', error);
    throw error;
  }
}

/**
 * Cancel/close the comment form
 */
export function cancelComment(): void {
  try {
    const form = document.querySelector('faceplate-form') as HTMLFormElement;
    if (form) {
      const resetEvent = new Event('reset', { bubbles: true });
      form.dispatchEvent(resetEvent);
    }
  } catch (error) {
    console.error('Failed to cancel comment:', error);
  }
}
