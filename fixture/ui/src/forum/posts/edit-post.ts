import { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, HolochainError, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { decode } from "@msgpack/msgpack";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { clientContext } from "../../contexts";
import { sharedStyles } from "../../shared-styles";
import { Post } from "./types";

@customElement("edit-post")
export class EditPost extends LitElement {
  @consume({ context: clientContext })
  client!: AppClient;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString(),
  })
  originalPostHash!: ActionHash;

  @property()
  currentRecord!: Record;

  get currentPost() {
    return decode((this.currentRecord.entry as any).Present.entry) as Post;
  }

  @state()
  _title!: string;

  @state()
  _content!: string;

  isPostValid() {
    return true && this._title !== "" && this._content !== "";
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.currentRecord) {
      throw new Error(`The currentRecord property is required for the edit-post element`);
    }

    if (!this.originalPostHash) {
      throw new Error(`The originalPostHash property is required for the edit-post element`);
    }

    this._title = this.currentPost.title;
    this._content = this.currentPost.content;
  }

  async updatePost() {
    const post: Post = {
      title: this._title!,
      content: this._content!,
    };

    try {
      const updateRecord: Record = await this.client.callZome({
        role_name: "forum",
        zome_name: "posts",
        fn_name: "update_post",
        payload: {
          original_post_hash: this.originalPostHash,
          previous_post_hash: this.currentRecord.signed_action.hashed.hash,
          updated_post: post,
        },
      });

      this.dispatchEvent(
        new CustomEvent("post-updated", {
          composed: true,
          bubbles: true,
          detail: {
            originalPostHash: this.originalPostHash,
            previousPostHash: this.currentRecord.signed_action.hashed.hash,
            updatedPostHash: updateRecord.signed_action.hashed.hash,
          },
        }),
      );
    } catch (e) {
      alert((e as HolochainError).message);
    }
  }

  render() {
    return html`
      <section>
        <div>
          <label for="Title">Title</label>
          <input
            name="Title"
  .value=${this._title}
  @input=${(e: CustomEvent) => {
      this._title = (e.target as any).value;
    }}
  required
>
        </div>

        <div>
          <label for="Content">Content</label>
          <textarea
            name="Content"
  .value=${this._content}
  @input=${(e: CustomEvent) => {
      this._content = (e.target as any).value;
    }}
  required
></textarea>
        </div>


        <div>
          <button @click=${() =>
      this.dispatchEvent(
        new CustomEvent("edit-canceled", {
          bubbles: true,
          composed: true,
        }),
      )}
          >
            Cancel
          </button>
          <button .disabled=${!this.isPostValid()} @click=${() => this.updatePost()}>
            Save
          </button>
        </div>
      </section>
    `;
  }

  static styles = sharedStyles;
}
