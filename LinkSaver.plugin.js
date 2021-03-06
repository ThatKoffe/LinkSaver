/**
 * @name LinkSaver
 * @displayName LinkSaver
 * @authorId 557218928368156674
 * @website https://github.com/Serakoi/LinkSaver
 * @invite 7TK7Bbz
 * @updateUrl https://raw.githubusercontent.com/Serakoi/LinkSaver/main/LinkSaver.plugin.js
 */

const fs = require('fs');
const db = require('./LS-utils/db.json');

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/


module.exports = (() => {
	const config = {
		info: {
			name: "LinkSaver",
			authors: [
				{
					name: "Seer",
					discord_id: "405126960902176768",
					github_username: "Serakoi"
				}
			],
			version: "0.0.6",
			description: "Save links so that you have easy access to them!",
			github: "https://github.com/Serakoi/LinkSaver"
		},
		changelog: [
			{
				title: "What's next?",
				items: [
					"Unkown yet!"
				]
			},
			{
				title: "Friendly urls!",
				type: "improved",
				items: [
					"Woah! You can now add a friendly version of the url! This means that you can add some text that will be shown instead of the entire url"
				]
			},
			{
				title: "Bug Fixes",
				type: "fixed",
				items: [
					"Link underscore removed from the chip."
				]
			},
			{
				title: "Credits",
				type: "improved",
				items: [
					"Seer#6054 - Developer",
					"Kαi#4320 - Tester",
					"Slimakoi#6422 - Tester"
				]
			}
		]
	};
	// ? changelog options: added, fixed, improved

	var jsonToMinimize = {
		"pkg": {

		}
	}

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }
		load() {
			BdApi.showConfirmationModal("Library plugin is needed",
				[`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`], {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
						if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}
		start() { }
		stop() { }
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const { Settings, PluginUtilities, Patcher } = Api;
			const { SettingPanel, SettingGroup, SettingField, Textbox, Switch } = Settings;

			const targetElement = '.buttons-3JBrkn'
			const inputArea = '.slateTextArea-1Mkdgw div span span span'

			let windowIsOpen = false;

			// ? Button code
			const linkButton = `
			<button aria-label="LinkSaver" tabindex="0" type="button" class="button-38aScr da-button lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow">
			<div class="contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">
			<div class="buttonWrapper-1ZmCpA da-buttonWrapper" id="children" style="opacity: 1; transform: none;">
			<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6.188 8.719c.439-.439.926-.801 1.444-1.087 2.887-1.591 6.589-.745 8.445 2.069l-2.246 2.245c-.644-1.469-2.243-2.305-3.834-1.949-.599.134-1.168.433-1.633.898l-4.304 4.306c-1.307 1.307-1.307 3.433 0 4.74 1.307 1.307 3.433 1.307 4.74 0l1.327-1.327c1.207.479 2.501.67 3.779.575l-2.929 2.929c-2.511 2.511-6.582 2.511-9.093 0s-2.511-6.582 0-9.093l4.304-4.306zm6.836-6.836l-2.929 2.929c1.277-.096 2.572.096 3.779.574l1.326-1.326c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.311 1.311-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.051l-2.246 2.245c.236.358.481.667.796.982.812.812 1.846 1.417 3.036 1.704 1.542.371 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.304-4.305c2.512-2.511 2.512-6.582.001-9.093-2.511-2.51-6.581-2.51-9.092 0z"/></svg>
			</div>
			</div>
			</button>
			`
			let UserLinks = [];

			function createToast(content, type, timeout) {
				let output_type = '';
				let output_timeout = 3000;

				let types = ["info", "success", "danger", "error", "warning", "warn"]
				if (types.includes(type)) output_type = type;

				if (timeout) output_timeout = timeout;
				BdApi.showToast(content, {
					type: output_type,
					timeout: output_timeout
				})
			}

			return class saveLinks extends Plugin {

				/**
				 * 
				 * @param {string} content Content to show inside the toast.
				 * @param {string} type Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
				 * @param {number} timeout Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
				 */

				onStart() {
					// ? Styling
					PluginUtilities.addStyle(config.info.name + '-CSS',
						`
						:root {
							--ls-bg: #2C2F33;
							--ls-bg-2: #23272A;
							--ls-font-capital: #7289DA;
							--ls-font: #99AAB5;
						}
						
						.swal2-modal {
							background-color: var(--ls-bg) !important;
						}
						.swal2-modal .swal2-title {
							color: var(--ls-font-capital) !important;
						}
						.swal2-modal .swal2-content {
							color: var(--ls-font) !important;
						}

						/*
							For links
						*/
						.sl-link-display {
							display: block; /* inline-block */
							padding: 0 25px;
							height: 50px;
							font-size: 16px;
							line-height: 50px;
							border-radius: 25px;
							background-color: var(--ls-bg-2);
						}
						/*
							Buttons
						*/
						.ls-button {
							margin: 10px;
							padding: 4px;
							border-radius: 5px;
							background: rgba(74, 74, 74, 0.62);
							color: var(--ls-font);
						}
						.ls-button.ls-remove {
							background: rgba(255, 0, 0, 0.62);
							color: white;
						}
						`
					);
					var script = document.createElement('script');
					script.type = 'text/javascript';
					script.id = config.info.name + '-SA'
					script.src = '//cdn.jsdelivr.net/npm/sweetalert2@10';

					var fun = document.createElement('script');
					fun.type = 'text/javascript';
					fun.id = config.info.name + '-FUN'
					fun.innerHTML = `			
					`


					document.getElementsByTagName('head')[0].appendChild(script);

					// this.renderButton();
					setTimeout(() => {
						this.generateButton();
					}, 1000);

					async function _checkUpdate_() {
						const data = await fetch('https://raw.githubusercontent.com/Serakoi/LinkSaver/main/main.config.json', {
							method: "GET"
						});
						console.log(data.body)
						if (data.body.latestVersion !== config.info.version) {
							let isOpen = false;
							if (!isOpen) {
								isOpen = true;
								createToast(`Update required, New LinkSaver version: ${data.latestVersion}\nUsing: ${config.info.version}`, "warning", 8000)
								createToast(
									data.body,
									"info",
									20000
								)
							}
						}
					}
					// _checkUpdate_();

					createToast('Loaded all LS assets!', "info")
				}

				onStop() {
					PluginUtilities.removeStyle(config.info.name + 'CSS');

					let btn = document.getElementById('btn-' + config.info.name);
					btn.remove();

					document.getElementById(config.info.name + '-SA').remove();
				}

				onSwitch() {
					// TODO : Add listener for if the button is **NOT** there...
					this.generateButton();
				}

				renderButton() {
					// ? Display button
					// var tag = document.createElement("p");
					// var text = document.createTextNode("Tutorix is the best e-learning platform");
					// tag.appendChild(text);
					// document.querySelector(targetElement).appendChild(tag)
				}

				generateButton() {
					const button = document.createElement('div'),
						messageBtnSelect = document.querySelector(targetElement)

					// TODO : Create button class
					var btnClass;

					button.setAttribute('id', 'btn-' + config.info.name)

					messageBtnSelect.append(button);

					let btnAction = document.getElementById('btn-' + config.info.name);

					button.innerHTML = linkButton;

					btnAction.addEventListener('click', () => {
						this.openSelectionWindow();
					});
				}

				openSelectionWindow() {
					let windowState = false;
					if (windowIsOpen) {
						windowState = true;
					}

					// ? Select another to insert new link or to select existing
					Swal.fire({
						title: 'Select Option',
						text: "View/Create your links!",
						icon: 'info',
						showCancelButton: true,
						confirmButtonText: 'View Links',
						cancelButtonText: 'Create Link',
						reverseButtons: true
					}).then((result) => {
						if (result.isConfirmed) {
							const arrayChecker = [];

							for (var i in db)
								arrayChecker.push(db[i]);

							let linkLib = ``;
							if (arrayChecker.length == 0) {
								linkLib = `You don't have any links yet!`;
							} else {
								// TODO : Make it so that the user can send it.
								const arrayDB = [];

								for (var i in db)
									arrayDB.push(db[i]);

								function deleteLS(id){
									delete db[id]
								}

								arrayDB.forEach(x => {
									// ? Link text for older db versions
									let linkText = x.text;
									if (!linkText) linkText = x.url;

									let linkId = x.url;

									linkLib = linkLib + `
										<div class="sl-link-display">
											<a style="text-decoration: none !important;" class="anchor-3Z-8Bb da-anchor anchorUnderlineOnHover-2ESHQB da-anchorUnderlineOnHover" title="${x.url}" href="${x.url}" rel="noreferrer noopener" target="_blank" role="button" tabindex="0" onclick="ls_useLink('${x.url}')">
												${x.text} 
											</a>
											<!-- <button class="ls-button ls-remove ls_remove_link_" id="${x.url}">
												✖
											</button> -->
										</div>
									&nbsp;`;
								});
							}
							Swal.fire(
								'My Links',
								`
								<script>
									function ls_removeLink(id){
										delete db[id];
									}
								</script>
								<div id="sl-link-box">${linkLib}</div><br>
								<span>Remove stored links by going to the <strong>LS-utils</strong> folder then <strong>db.json</strong> and edit that file.</span>`,
								'info'
							)
						} else if (result.dismiss === Swal.DismissReason.cancel) {
							Swal.fire({
								title: 'Submit new link',
								html: `
									<input autocapitalize="off" id="ls-friendlyText" class="swal2-input" placeholder="Friendly Text" type="text" style="display: flex;">
								`,
								input: 'text',
								inputAttributes: {
									placeHolder: 'Url',
									autocapitalize: 'off'
								},
								showCancelButton: true,
								confirmButtonText: 'Next',
								showLoaderOnConfirm: true,
								preConfirm: (link) => {
									if(!link) return createToast('No link provided!', 'error', 4000);
									// ? Do something with text
									if(!db[link]) {
										let linkId = Date.now()
										// createToast(linkId)

										let friendlyText = document.getElementById("ls-friendlyText").value;
										if (friendlyText.length == 0) friendlyText = link
										db[link] = {
											id: linkId,
											url: link,
											text: friendlyText
										}
										fs.writeFile(__dirname + "/LS-utils/db.json", JSON.stringify(db), (err) => {
											console.log('[LS] ->', err)
										})
									} else {
										createToast('Error: This link is already saved!', 'error', 3000);
									}
									// if(UserLinks.includes(link)){
									// 	createToast('Error: This link is already saved!', 'error', 3000);
									// } else {
									// 	UserLinks.push(link)
									// }
								},
								allowOutsideClick: () => !Swal.isLoading()
							}).then((result) => {
								if (result.isConfirmed) {
									// ? Success
									Swal.fire({
										title: "Done!",
										icon: "success"
									})
								}
							})
						}
					})

				}


				createCredits() {

				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();