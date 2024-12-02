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
 * Set text content in Reddit's comment box
 * @param text Text to set in the comment box
 * @returns Promise that resolves when text is set
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

    // Dispatch necessary events
    const events = ['input', 'change', 'blur'];
    events.forEach(eventType => {
      editor.dispatchEvent(new Event(eventType, { bubbles: true }));
    });

    // Update the form's internal state
    const form = composer.closest('faceplate-form');
    if (form) {
      const customEvent = new CustomEvent('content-change', {
        bubbles: true,
        detail: { content: text, nodes }
      });
      form.dispatchEvent(customEvent);
    }

  } catch (error) {
    console.error('Failed to set comment text:', error);
    throw error;
  }
}

/**
 * Submit the comment form
 * @returns Promise that resolves when comment is submitted
 */
export async function submitComment(): Promise<void> {
  try {
    // Find the form element
    const form = document.querySelector('faceplate-form') as HTMLFormElement;
    if (!form) {
      throw new Error('Comment form not found');
    }

    // Submit the form
    const submitEvent = new SubmitEvent('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(submitEvent);

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
