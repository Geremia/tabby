/* eslint-disable @typescript-eslint/no-namespace */

import {
  ProtocolRequestType0,
  ProtocolRequestType,
  ProtocolNotificationType,
  RegistrationType,
  MessageDirection,
  URI,
  Range,
  InitializeRequest as LspInitializeRequest,
  InitializeParams as LspInitializeParams,
  InitializeResult as LspInitializeResult,
  InitializeError,
  ClientCapabilities as LspClientCapabilities,
  ServerCapabilities as LspServerCapabilities,
  ConfigurationRequest as LspConfigurationRequest,
  DidChangeConfigurationNotification as LspDidChangeConfigurationNotification,
  DidChangeConfigurationParams as LspDidChangeConfigurationParams,
  CompletionRequest as LspCompletionRequest,
  CompletionParams,
  CompletionList as LspCompletionList,
  CompletionItem as LspCompletionItem,
  InlineCompletionRequest as LspInlineCompletionRequest,
  InlineCompletionParams,
  InlineCompletionList as LspInlineCompletionList,
  InlineCompletionItem as LspInlineCompletionItem,
  DeclarationParams,
  Declaration,
  LocationLink,
  SemanticTokensRangeParams,
  SemanticTokens,
  SemanticTokensLegend,
} from "vscode-languageserver-protocol";

/**
 * Extends LSP method Initialize Request(↩️)
 *
 * - method: `initialize`
 * - params: {@link InitializeParams}
 * - result: {@link InitializeResult}
 */
export namespace InitializeRequest {
  export const method = LspInitializeRequest.method;
  export const messageDirection = LspInitializeRequest.messageDirection;
  export const type = new ProtocolRequestType<InitializeParams, InitializeResult, InitializeError, void, void>(method);
}

export type InitializeParams = LspInitializeParams & {
  clientInfo?: ClientInfo;
  initializationOptions?: {
    config?: ClientProvidedConfig;
  };
  capabilities: ClientCapabilities;
};

export type InitializeResult = LspInitializeResult & {
  capabilities: ServerCapabilities;
};

/**
 * [Tabby] Defines the name and version information of the IDE and the tabby plugin.
 */
export type ClientInfo = {
  name: string;
  version?: string;
  tabbyPlugin?: {
    name: string;
    version?: string;
  };
};

export type ClientCapabilities = LspClientCapabilities & {
  tabby?: {
    /**
     * The client supports:
     * - `tabby/agent/didChangeStatus`
     * - `tabby/agent/didUpdateIssue`
     * This capability indicates that client support receiving agent notifications.
     */
    agent?: boolean;
    /**
     * The client supports:
     * - `tabby/workspaceFileSystem/readFile`
     * This capability improves the workspace code snippets context (RAG).
     * When not provided, the server will try to fallback to NodeJS provided `fs` module,
     *  which is not available in the browser.
     */
    workspaceFileSystem?: boolean;
    /**
     * The client supports:
     * - `tabby/dataStore/get`
     * - `tabby/dataStore/set`
     * When not provided, the server will try to fallback to the default data store,
     *  a file-based data store (~/.tabby-client/agent/data.json), which is not available in the browser.
     */
    dataStore?: boolean;
    /**
     * The client supports:
     * - `tabby/languageSupport/textDocument/declaration`
     * - `tabby/languageSupport/textDocument/semanticTokens/range`
     * This capability improves the workspace code snippets context (RAG).
     */
    languageSupport?: boolean;
    /**
     * The client supports:
     * - `tabby/git/repository`
     * - `tabby/git/diff`
     * This capability improves the workspace git repository context (RAG).
     * When not provided, the server will try to fallback to the default git provider,
     *  which running system `git` command, not available if cannot execute `git` command,
     *  not available in the browser.
     */
    gitProvider?: boolean;
    /**
     * The client supports:
     * - `tabby/editorOptions`
     * This capability improves the completion formatting.
     */
    editorOptions?: boolean;
  };
};

export type ServerCapabilities = LspServerCapabilities & {
  tabby?: {
    /**
     * The server supports:
     * - `tabby/chat/generateCommitMessage`
     * See {@link ChatFeatureRegistration}
     */
    chat?: boolean;
  };
};

export namespace ChatFeatureRegistration {
  export const type = new RegistrationType("tabby/chat");
}

/**
 * Extends LSP method Configuration Request(↪️)
 *
 * - method: `workspace/configuration`
 * - params: any
 * - result: {@link ClientProvidedConfig}[] (the array contains only one config)
 */
export namespace ConfigurationRequest {
  export const method = LspConfigurationRequest.method;
  export const messageDirection = LspConfigurationRequest.messageDirection;
  export const type = new ProtocolRequestType<any, ClientProvidedConfig[], never, void, void>(method);
}

/**
 * [Tabby] Defines the config supported to be changed on the client side (IDE).
 */
export type ClientProvidedConfig = {
  /**
   * Specifies the endpoint and token for connecting to the Tabby server.
   */
  server?: {
    endpoint?: string;
    token?: string;
  };
  /**
   * Trigger mode should be implemented on the client side.
   * Sending this config to the server is for telemetry purposes.
   */
  inlineCompletion?: {
    triggerMode?: "auto" | "manual";
  };
  /**
   * Keybindings should be implemented on the client side.
   * Sending this config to the server is for telemetry purposes.
   */
  keybindings?: "default" | "tabby-style" | "customize";
  /**
   * Controls whether the telemetry is enabled or not.
   */
  anonymousUsageTracking?: {
    disable?: boolean;
  };
};

/**
 * Extends LSP method DidChangeConfiguration Notification(➡️)
 * - method: `workspace/didChangeConfiguration`
 * - params: {@link DidChangeConfigurationParams}
 * - result: void
 */
export namespace DidChangeConfigurationNotification {
  export const method = LspDidChangeConfigurationNotification.method;
  export const messageDirection = LspDidChangeConfigurationNotification.messageDirection;
  export const type = new ProtocolNotificationType<DidChangeConfigurationParams, void>(method);
}

export type DidChangeConfigurationParams = LspDidChangeConfigurationParams & {
  settings: ClientProvidedConfig | null;
};

/**
 * Extends LSP method Completion Request(↩️)
 *
 * Note: Tabby provides this method capability *only* when the client has *NO* `textDocument/inlineCompletion` capability.
 * - method: `textDocument/completion`
 * - params: {@link CompletionParams}
 * - result: {@link CompletionList} | null
 */
export namespace CompletionRequest {
  export const method = LspCompletionRequest.method;
  export const messageDirection = LspCompletionRequest.messageDirection;
  export const type = new ProtocolRequestType<CompletionParams, CompletionList | null, never, void, void>(method);
}

export type CompletionList = LspCompletionList & {
  items: CompletionItem[];
};

export type CompletionItem = LspCompletionItem & {
  data?: {
    /**
     * The eventId is for telemetry purposes, should be used in `tabby/telemetry/event`.
     */
    eventId?: CompletionEventId;
  };
};

export type CompletionEventId = {
  completionId: string;
  choiceIndex: number;
};

/**
 * Extends LSP method Inline Completion Request(↩️)
 *
 * Note: Tabby provides this method capability only when the client has `textDocument/inlineCompletion` capability.
 * - method: `textDocument/inlineCompletion`
 * - params: {@link InlineCompletionParams}
 * - result: {@link InlineCompletionList} | null
 */
export namespace InlineCompletionRequest {
  export const method = LspInlineCompletionRequest.method;
  export const messageDirection = LspInlineCompletionRequest.messageDirection;
  export const type = new ProtocolRequestType<InlineCompletionParams, InlineCompletionList | null, never, void, void>(
    method,
  );
}

export type InlineCompletionList = LspInlineCompletionList & {
  isIncomplete: boolean;
  items: InlineCompletionItem[];
};

export type InlineCompletionItem = LspInlineCompletionItem & {
  data?: {
    /**
     * The eventId is for telemetry purposes, should be used in `tabby/telemetry/event`.
     */
    eventId?: CompletionEventId;
  };
};

/**
 * [Tabby] GenerateCommitMessage Request(↩️)
 *
 * This method is sent from the client to the server to generate a commit message for a git repository.
 * - method: `tabby/chat/generateCommitMessage`
 * - params: {@link GenerateCommitMessageParams}
 * - result: {@link GenerateCommitMessageResult} | null
 * - error: {@link ChatFeatureNotAvailableError}
 */
export namespace GenerateCommitMessageRequest {
  export const method = "tabby/chat/generateCommitMessage";
  export const messageDirection = MessageDirection.clientToServer;
  export const type = new ProtocolRequestType<
    GenerateCommitMessageParams,
    GenerateCommitMessageResult | null,
    ChatFeatureNotAvailableError,
    void,
    void
  >(method);
}

export type GenerateCommitMessageParams = {
  /**
   * The root URI of the git repository.
   */
  repository: URI;
};

export type GenerateCommitMessageResult = {
  commitMessage: string;
};

export type ChatFeatureNotAvailableError = {
  name: "ChatFeatureNotAvailableError";
};

/**
 * [Tabby] Telemetry Event Notification(➡️)
 *
 * This method is sent from the client to the server for telemetry purposes.
 * - method: `tabby/telemetry/event`
 * - params: {@link EventParams}
 * - result: void
 */
export namespace TelemetryEventNotification {
  export const method = "tabby/telemetry/event";
  export const messageDirection = MessageDirection.clientToServer;
  export const type = new ProtocolNotificationType<EventParams, void>(method);
}

export type EventParams = {
  type: "view" | "select" | "dismiss";
  selectKind?: "line";
  eventId: CompletionEventId;
  viewId?: string;
  elapsed?: number;
};

/**
 * [Tabby] DidChangeServerConfig Notification(⬅️)
 *
 * This method is sent from the server to the client to notify the current configuration
 * for connecting to the Tabby server has changed.
 * - method: `tabby/agent/didChangeServerConfig`
 * - params: {@link DidChangeServerConfigParams}
 * - result: void
 */
export namespace AgentServerConfigSync {
  export const method = "tabby/agent/didChangeServerConfig";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolNotificationType<DidChangeServerConfigParams, void>(method);
}

export type DidChangeServerConfigParams = {
  server: ServerConfig;
};

export type ServerConfig = {
  endpoint: string;
  token: string;
  requestHeaders: Record<string, string | number | boolean | null | undefined> | null;
};

/**
 * [Tabby] Server Config Request(↩️)
 *
 * This method is sent from the client to the server to check the current configuration
 * for connecting to the Tabby server.
 * - method: `tabby/agent/server`
 * - params: none
 * - result: {@link ServerConfig}
 */
export namespace AgentServerConfigRequest {
  export const method = "tabby/agent/server";
  export const messageDirection = MessageDirection.clientToServer;
  export const type = new ProtocolRequestType0<ServerConfig, never, void, void>(method);
}

/**
 * [Tabby] DidChangeStatus Notification(⬅️)
 *
 * This method is sent from the server to the client to notify the client about the status of the server.
 * - method: `tabby/agent/didChangeStatus`
 * - params: {@link DidChangeStatusParams}
 * - result: void
 */
export namespace AgentStatusSync {
  export const method = "tabby/agent/didChangeStatus";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolNotificationType<DidChangeStatusParams, void>(method);
}

export type DidChangeStatusParams = {
  status: Status;
};

export type Status = "notInitialized" | "ready" | "disconnected" | "unauthorized" | "finalized";

/**
 * [Tabby] Status Request(↩️)
 *
 * This method is sent from the client to the server to check the current status of the server.
 * - method: `tabby/agent/status`
 * - params: none
 * - result: {@link Status}
 */
export namespace AgentStatusRequest {
  export const method = "tabby/agent/status";
  export const messageDirection = MessageDirection.clientToServer;
  export const type = new ProtocolRequestType0<Status, never, void, void>(method);
}

/**
 * [Tabby] DidUpdateIssue Notification(⬅️)
 *
 * This method is sent from the server to the client to notify the client about the current issues.
 * - method: `tabby/agent/didUpdateIssues`
 * - params: {@link DidUpdateIssueParams}
 * - result: void
 */
export namespace AgentIssuesSync {
  export const method = "tabby/agent/didUpdateIssues";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolNotificationType<DidUpdateIssueParams, void>(method);
}

export type DidUpdateIssueParams = IssueList;

export type IssueList = {
  issues: IssueName[];
};

export type IssueName = "slowCompletionResponseTime" | "highCompletionTimeoutRate" | "connectionFailed";

/**
 * [Tabby] Issues Request(↩️)
 *
 * This method is sent from the client to the server to check if there is any issue.
 * - method: `tabby/agent/issues`
 * - params: none
 * - result: {@link IssueList}
 */
export namespace AgentIssuesRequest {
  export const method = "tabby/agent/issues";
  export const messageDirection = MessageDirection.clientToServer;
  export const type = new ProtocolRequestType0<IssueList, never, void, void>(method);
}

/**
 * [Tabby] Issue Detail Request(↩️)
 *
 * This method is sent from the client to the server to check the detail of an issue.
 * - method: `tabby/agent/issue/detail`
 * - params: {@link IssueDetailParams}
 * - result: {@link IssueDetailResult} | null
 */
export namespace AgentIssueDetailRequest {
  export const method = "tabby/agent/issue/detail";
  export const messageDirection = MessageDirection.clientToServer;
  export const type = new ProtocolRequestType<IssueDetailParams, IssueDetailResult, never, void, void>(method);
}

export type IssueDetailParams = {
  name: IssueName;
  helpMessageFormat?: "markdown";
};

export type IssueDetailResult = {
  name: IssueName;
  helpMessage?: string;
};

/**
 * [Tabby] Read File Request(↪️)
 *
 * This method is sent from the server to the client to read the file contents.
 * - method: `tabby/workspaceFileSystem/readFile`
 * - params: {@link ReadFileParams}
 * - result: {@link ReadFileResult} | null
 */
export namespace ReadFileRequest {
  export const method = "tabby/workspaceFileSystem/readFile";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<ReadFileParams, ReadFileResult | null, never, void, void>(method);
}

export type ReadFileParams = {
  uri: URI;
  /**
   * If `text` is select, the result should try to decode the file contents to string,
   * otherwise, the result should be a raw binary array.
   */
  format: "text";
  /**
   * When omitted, read the whole file.
   */
  range?: Range;
};

export type ReadFileResult = {
  /**
   * If `text` is select, the result should be a string.
   */
  text?: string;
};

/**
 * [Tabby] DataStore Get Request(↪️)
 *
 * This method is sent from the server to the client to get the value of the given key.
 * - method: `tabby/dataStore/get`
 * - params: {@link DataStoreGetParams}
 * - result: any
 */
export namespace DataStoreGetRequest {
  export const method = "tabby/dataStore/get";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<DataStoreGetParams, any, never, void, void>(method);
}

export type DataStoreGetParams = {
  key: string;
};

/**
 * [Tabby] DataStore Set Request(↪️)
 *
 * This method is sent from the server to the client to set the value of the given key.
 * - method: `tabby/dataStore/set`
 * - params: {@link DataStoreSetParams}
 * - result: boolean
 */
export namespace DataStoreSetRequest {
  export const method = "tabby/dataStore/set";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<DataStoreSetParams, boolean, never, void, void>(method);
}

export type DataStoreSetParams = {
  key: string;
  value: any;
};

/**
 * [Tabby] Language Support Declaration Request(↪️)
 *
 * This method is sent from the server to the client to request the support from another language server.
 * See LSP `textDocument/declaration`.
 * - method: `tabby/languageSupport/textDocument/declaration`
 * - params: {@link DeclarationParams}
 * - result: {@link Declaration} | {@link LocationLink}[] | null
 */
export namespace LanguageSupportDeclarationRequest {
  export const method = "tabby/languageSupport/textDocument/declaration";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<
    DeclarationParams,
    Declaration | LocationLink[] | null,
    never,
    void,
    void
  >(method);
}

/**
 * [Tabby] Semantic Tokens Range Request(↪️)
 *
 * This method is sent from the server to the client to request the support from another language server.
 * See LSP `textDocument/semanticTokens/range`.
 * - method: `tabby/languageSupport/textDocument/semanticTokens/range`
 * - params: {@link SemanticTokensRangeParams}
 * - result: {@link SemanticTokensRangeResult} | null
 */
export namespace LanguageSupportSemanticTokensRangeRequest {
  export const method = "tabby/languageSupport/textDocument/semanticTokens/range";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<
    SemanticTokensRangeParams,
    SemanticTokensRangeResult | null,
    never,
    void,
    void
  >(method);
}

export type SemanticTokensRangeResult = {
  legend: SemanticTokensLegend;
  tokens: SemanticTokens;
};

/**
 * [Tabby] Git Repository Request(↪️)
 *
 * This method is sent from the server to the client to get the git repository state of a file.
 * - method: `tabby/git/repository`
 * - params: {@link GitRepositoryParams}
 * - result: {@link GitRepository} | null
 */
export namespace GitRepositoryRequest {
  export const method = "tabby/git/repository";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<GitRepositoryParams, GitRepository | null, never, void, void>(method);
}

export type GitRepositoryParams = {
  /**
   * The URI of the file to get the git repository state of.
   */
  uri: URI;
};

export type GitRepository = {
  /**
   * The root URI of the git repository.
   */
  root: URI;
  /**
   * The url of the default remote.
   */
  remoteUrl?: string;
  /**
   * List of remotes in the git repository.
   */
  remotes?: {
    name: string;
    url: string;
  }[];
};

/**
 * [Tabby] Git Diff Request(↪️)
 *
 * This method is sent from the server to the client to get the diff of a git repository.
 * - method: `tabby/git/diff`
 * - params: {@link GitDiffParams}
 * - result: {@link GitDiffResult} | null
 */
export namespace GitDiffRequest {
  export const method = "tabby/git/diff";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<GitDiffParams, GitDiffResult | null, never, void, void>(method);
}

export type GitDiffParams = {
  /**
   * The root URI of the git repository.
   */
  repository: URI;
  /**
   * Returns the cached or uncached diff of the git repository.
   */
  cached: boolean;
};

export type GitDiffResult = {
  /**
   * The diff of the git repository.
   * - It could be the full diff.
   * - It could be a list of diff for each single file, sorted by the priority.
   *   This will be useful when the full diff is too large, and we will select
   *   from the split diffs to generate a prompt under the tokens limit.
   */
  diff: string | string[];
};

/**
 * [Tabby] Editor Options Request(↪️)
 *
 * This method is sent from the server to the client to get the diff of a git repository.
 * - method: `tabby/editorOptions`
 * - params: {@link EditorOptionsParams}
 * - result: {@link EditorOptions} | null
 */
export namespace EditorOptionsRequest {
  export const method = "tabby/editorOptions";
  export const messageDirection = MessageDirection.serverToClient;
  export const type = new ProtocolRequestType<EditorOptionsParams, EditorOptions | null, never, void, void>(method);
}

export type EditorOptionsParams = {
  /**
   * The uri of the document for which the editor options are requested.
   */
  uri: URI;
};

export type EditorOptions = {
  /**
   * A string representing the indentation for the editor. It could be 2 or 4 spaces, or 1 tab.
   */
  indentation: string;
};
