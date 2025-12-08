import { ActionHash, AgentPubKey, AppClient, EntryHash, InstalledCell, Link, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { clientContext } from "../../contexts";
import { sharedStyles } from "../../shared-styles";
import { PostsSignal } from "./types";

import "./comment-detail";

@customElement("comments-for-post")
export class CommentsForPost extends LitElement {
  @consume({ context: clientContext })
  client!: AppClient;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal.toString() !== oldVal?.toString(),
  })
  postHash!: ActionHash;

  @state()
  hashes: Array<ActionHash> = [];

  _fetchComments = new Task(this, ([postHash]: readonly ActionHash[]) =>
    this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_comments_for_post",
      payload: postHash,
    }) as Promise<Array<Link>>, () => [this.postHash]);

  firstUpdated() {
    if (!this.postHash) {
      throw new Error(`The postHash property is required for the comments-for-post element`);
    }

    this.client?.on("signal", signal => {
      if (signal.type !== "app") return;
      if (signal.value.zome_name !== "posts") return;
      const payload = signal.value.payload as PostsSignal;
      if (!(payload.type === "EntryCreated" && payload.app_entry.type === "Comment")) return;
      this._fetchComments.run();
    });
  }

  renderList(hashes: Array<ActionHash>) {
    if (!hashes.length) return html`<div class="alert">No comments found for this post.</div>`;

    return html`
      <div>
        ${
      hashes.map(hash =>
        html`
          <comment-detail
            .commentHash=${hash}
            @comment-deleted=${() => {
          this._fetchComments.run();
          this.hashes = [];
        }}
          ></comment-detail>
        `
      )
    }
      </div>
    `;
  }

  render() {
    return this._fetchComments.render({
      pending: () => html`<progress></progress>`,
      complete: (links) => this.renderList([...this.hashes, ...links.map(l => l.target)]),
      error: (e: any) => html`<div class="alert">Error fetching comments: ${e.message}.</div>`,
    });
  }

  static styles = sharedStyles;
}
