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
import { Post } from "./types";

@customElement("create-post")
export class CreatePost extends LitElement {
  @consume({ context: clientContext })
  client!: AppClient;

  @state()
  _title: string = "";

  @state()
  _content: string = "";

  firstUpdated() {
  }

  isPostValid() {
    return true && this._title !== "" && this._content !== "";
  }

  async createPost() {
    const post: Post = {
      title: this._title,
      content: this._content,
    };

    try {
      const record: Record = await this.client.callZome({
        role_name: "forum",
        zome_name: "posts",
        fn_name: "create_post",
        payload: post,
      });

      this.dispatchEvent(
        new CustomEvent("post-created", {
          composed: true,
          bubbles: true,
          detail: {
            postHash: record.signed_action.hashed.hash,
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
        <h3>Create Post</h3>
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

        <button
          .disabled=${!this.isPostValid()}
          @click=${() => this.createPost()}
        >
          Create Post
        </button>
      </div>
    `;
  }

  static styles = sharedStyles;
}
