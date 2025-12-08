import { ActionHash, AgentPubKey, AppClient, EntryHash, Link, NewEntryAction, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { clientContext } from "../../contexts";
import { sharedStyles } from "../../shared-styles";
import { PostsSignal } from "./types";

import "./post-detail";

@customElement("all-posts")
export class AllPosts extends LitElement {
  @consume({ context: clientContext })
  client!: AppClient;

  @state()
  signaledHashes: Array<ActionHash> = [];

  _fetchPosts = new Task(this, ([]: any) =>
    this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_all_posts",
    }) as Promise<Array<Link>>, () => []);

  firstUpdated() {
    this.client?.on("signal", signal => {
      if (signal.type !== "app") return;
      if (signal.value.zome_name !== "posts") return;
      const payload = signal.value.payload as PostsSignal;
      if (payload.type !== "EntryCreated") return;
      if (payload.app_entry.type !== "Post") return;
      this.signaledHashes = [payload.action.hashed.hash, ...this.signaledHashes];
    });
  }

  renderList(hashes: Array<ActionHash>) {
    if (!hashes.length) return html`<div class="alert">No posts found.</div>`;

    return html`
      <div>
        ${
      hashes.map(hash =>
        html`
          <post-detail
            .postHash=${hash}
            @post-deleted=${() => {
          this._fetchPosts.run();
          this.signaledHashes = [];
        }}
          ></post-detail>
        `
      )
    }
      </div>
    `;
  }

  render() {
    return this._fetchPosts.render({
      pending: () => html`<progress></progress>`,
      complete: (links) => this.renderList([...this.signaledHashes, ...links.map(l => l.target)]),
      error: (e: any) => html`<div class="alert">Error fetching the posts: ${e.message}.</div>`,
    });
  }

  static styles = sharedStyles;
}
