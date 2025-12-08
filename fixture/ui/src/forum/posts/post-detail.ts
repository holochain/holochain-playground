import { ActionHash, AppClient, DnaHash, EntryHash, HolochainError, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { decode } from "@msgpack/msgpack";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./edit-post";

import { clientContext } from "../../contexts";
import { sharedStyles } from "../../shared-styles";
import { Post } from "./types";

@customElement("post-detail")
export class PostDetail extends LitElement {
  @consume({ context: clientContext })
  client!: AppClient;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString(),
  })
  postHash!: ActionHash;

  _fetchRecord = new Task(this, ([postHash]: readonly ActionHash[]) =>
    this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_latest_post",
      payload: postHash,
    }) as Promise<Record | undefined>, () => [this.postHash]);

  @state()
  _editing = false;

  firstUpdated() {
    if (!this.postHash) {
      throw new Error(`The postHash property is required for the post-detail element`);
    }
  }

  async deletePost() {
    try {
      await this.client.callZome({
        role_name: "forum",
        zome_name: "posts",
        fn_name: "delete_post",
        payload: this.postHash,
      });
      this.dispatchEvent(
        new CustomEvent("post-deleted", {
          bubbles: true,
          composed: true,
          detail: {
            postHash: this.postHash,
          },
        }),
      );
      this._fetchRecord.run();
    } catch (e) {
      alert((e as HolochainError).message);
    }
  }

  renderDetail(record: Record) {
    const post = decode((record.entry as any).Present.entry) as Post;

    return html`
      <section>
        <div>
	        <span><strong>Title: </strong></span>
 	        <span>${post.title}</span>
        </div>
        <div>
	        <span><strong>Content: </strong></span>
 	        <span>${post.content}</span>
        </div>

      	<div>
          <button @click=${() => {
      this._editing = true;
    }}>edit</button>
          <button @click=${() => this.deletePost()}>delete</button>
        </div>
      </section>
    `;
  }

  renderPost(record: Record | undefined) {
    if (!record) return html`<div class="alert">The requested post was not found.</div>`;
    if (this._editing) {
      return html`
        <edit-post
          .originalPostHash=${this.postHash}
          .currentRecord=${record}
          @post-updated=${async () => {
        this._editing = false;
        await this._fetchRecord.run();
      }}
          @edit-canceled=${() => {
        this._editing = false;
      }}
        ></edit-post>
      `;
    }
    return this.renderDetail(record);
  }

  render() {
    return this._fetchRecord.render({
      pending: () => html`<progress></progress>`,
      complete: (record) => this.renderPost(record),
      error: (e: any) => html`<div class="alert">Error fetching the post: ${e.message}</div>`,
    });
  }

  static styles = sharedStyles;
}
