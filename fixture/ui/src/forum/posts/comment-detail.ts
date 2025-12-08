import { ActionHash, AppClient, DnaHash, EntryHash, HolochainError, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { decode } from "@msgpack/msgpack";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { clientContext } from "../../contexts";
import { sharedStyles } from "../../shared-styles";
import { Comment } from "./types";

@customElement("comment-detail")
export class CommentDetail extends LitElement {
  @consume({ context: clientContext })
  client!: AppClient;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString(),
  })
  commentHash!: ActionHash;

  _fetchRecord = new Task(this, ([commentHash]: readonly ActionHash[]) =>
    this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_comment",
      payload: commentHash,
    }) as Promise<Record | undefined>, () => [this.commentHash]);

  firstUpdated() {
    if (!this.commentHash) {
      throw new Error(`The commentHash property is required for the comment-detail element`);
    }
  }

  async deleteComment() {
    try {
      await this.client.callZome({
        role_name: "forum",
        zome_name: "posts",
        fn_name: "delete_comment",
        payload: this.commentHash,
      });
      this.dispatchEvent(
        new CustomEvent("comment-deleted", {
          bubbles: true,
          composed: true,
          detail: {
            commentHash: this.commentHash,
          },
        }),
      );
      this._fetchRecord.run();
    } catch (e) {
      alert((e as HolochainError).message);
    }
  }

  renderDetail(record: Record) {
    const comment = decode((record.entry as any).Present.entry) as Comment;

    return html`
      <section>
        <div>
	        <span><strong>Comment: </strong></span>
 	        <span>${comment.comment}</span>
        </div>

      	<div>
          <button @click=${() => this.deleteComment()}>delete</button>
        </div>
      </section>
    `;
  }

  renderComment(record: Record | undefined) {
    if (!record) return html`<div class="alert">The requested comment was not found.</div>`;
    return this.renderDetail(record);
  }

  render() {
    return this._fetchRecord.render({
      pending: () => html`<progress></progress>`,
      complete: (record) => this.renderComment(record),
      error: (e: any) => html`<div class="alert">Error fetching the comment: ${e.message}</div>`,
    });
  }

  static styles = sharedStyles;
}
