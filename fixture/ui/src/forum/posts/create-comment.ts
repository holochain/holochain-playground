import {
  ActionHash,
  AgentPubKey,
  AppClient,
  DnaHash,
  EntryHash,
  HolochainError,
  InstalledCell,
  Record,
} from "@holochain/client";
import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { clientContext } from "../../contexts";
import { sharedStyles } from "../../shared-styles";
import { Comment } from "./types";

@customElement("create-comment")
export class CreateComment extends LitElement {
  @consume({ context: clientContext })
  client!: AppClient;

  @property()
  postHash!: ActionHash;

  @state()
  _comment: string = "";

  firstUpdated() {
    if (this.postHash === undefined) {
      throw new Error(`The postHash input is required for the create-comment element`);
    }
  }

  isCommentValid() {
    return true && this._comment !== "";
  }

  async createComment() {
    const comment: Comment = {
      comment: this._comment,
      post_hash: this.postHash,
    };

    try {
      const record: Record = await this.client.callZome({
        role_name: "forum",
        zome_name: "posts",
        fn_name: "create_comment",
        payload: comment,
      });

      this.dispatchEvent(
        new CustomEvent("comment-created", {
          composed: true,
          bubbles: true,
          detail: {
            commentHash: record.signed_action.hashed.hash,
          },
        }),
      );
    } catch (e) {
      alert((e as HolochainError).message);
    }
  }

  render() {
    return html`
      <div>
        <h3>Create Comment</h3>
        <div>
          <label for="Comment">Comment</label>
          <textarea
            name="Comment"
  .value=${this._comment}
  @input=${(e: CustomEvent) => {
      this._comment = (e.target as any).value;
    }}
  required
></textarea>
        </div>

        <button
          .disabled=${!this.isCommentValid()}
          @click=${() => this.createComment()}
        >
          Create Comment
        </button>
      </div>
    `;
  }

  static styles = sharedStyles;
}
