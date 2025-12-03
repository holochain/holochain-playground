import { css } from 'lit';

export const sharedStyles = css`
	.row {
		display: flex;
		flex-direction: row;
	}
	.column {
		display: flex;
		flex-direction: column;
	}
	.small-margin {
		margin-top: 6px;
	}
	.big-margin {
		margin-top: 23px;
	}

	.fill {
		flex: 1;
		height: 100%;
	}

	.title {
		font-size: 20px;
	}

	.center-content {
		align-items: center;
		justify-content: center;
	}

	.placeholder {
		color: var(--sl-color-gray-700);
	}

	.flex-scrollable-parent {
		position: relative;
		display: flex;
		flex: 1;
	}

	.flex-scrollable-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.flex-scrollable-x {
		max-width: 100%;
		overflow-x: auto;
	}
	.flex-scrollable-y {
		max-height: 100%;
		overflow-y: auto;
	}
	:host {
		color: var(--sl-color-neutral-1000);
	}

	sl-card {
		display: flex;
	}
	sl-card::part(base) {
		flex: 1;
	}
	sl-card::part(body) {
		display: flex;
		flex: 1;
		height: 100%;
	}
	sl-drawer::part(body) {
		display: flex;
	}

	:host {
		display: flex;
	}

	.center-content {
		align-items: center;
		justify-content: center;
		display: flex;
	}

	span {
		margin-block-start: 0;
	}

	.title {
		font-size: 20px;
	}

	.placeholder {
		color: rgba(0, 0, 0, 0.6);
	}
	.json-info {
		padding: 4px;
		max-width: 400px;
	}

	.block-title {
		font-size: 20px;
	}

	.horizontal-divider {
		background-color: grey;
		height: 1px;
		opacity: 0.3;
		margin-bottom: 0;
		width: 100%;
	}
	.vertical-divider {
		background-color: grey;
		width: 1px;
		height: 100%;
		opacity: 0.3;
		margin-bottom: 0;
	}
	sl-tab-group {
		display: flex;
	}
	sl-tab-group::part(base) {
		display: flex;
		flex: 1;
	}
	sl-tab-group::part(body) {
		display: flex;
		flex: 1;
	}
	sl-tab-panel::part(base) {
		display: flex;
		flex: 1;
		width: 100%;
		height: 100%;
	}
	sl-tab-panel {
		height: 100%;
		width: 100%;
	}

	json-viewer {
		--background-color: #transparent;
		--color: #333333;
		--string-color: #e03131;
		--number-color: #12b886;
		--boolean-color: #5f3dc4;
		--null-color: #808080;
		--property-color: #228be6;
		--preview-color: #bd5f1b;
		--highlight-color: #ff0000;
		--outline-color: #666968;
		--outline-width: 1px;
		--outline-style: dotted;

		--font-family: Nimbus Mono PS, Courier New, monospace;
		--font-size: 1rem;
		--line-height: 1.2rem;

		--indent-size: 0.5em;
		--indentguide-size: 1px;
		--indentguide-style: solid;
		--indentguide-color: #ccc;
		--indentguide-color-active: #999;
		--indentguide: var(--indentguide-size) var(--indentguide-style)
			var(--indentguide-color);
		--indentguide-active: var(--indentguide-size) var(--indentguide-style)
			var(--indentguide-color-active);
	}
`;
