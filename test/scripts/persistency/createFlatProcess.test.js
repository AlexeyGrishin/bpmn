/**
 * AUTHOR: mrassinger
 * COPYRIGHT: E2E Technologies Ltd.
 */

var pathModule = require('path');
var fileUtilsModule = require('../../../lib/utils/file.js');
var bpmnProcessModule = require('../../../lib/process.js');
var Persistency = require('../../../lib/persistency.js').Persistency;
var BPMNProcessDefinition = require('../../../lib/bpmn/processDefinition.js').BPMNProcessDefinition;
var BPMNTask = require("../../../lib/bpmn/tasks.js").BPMNTask;
var BPMNStartEvent = require("../../../lib/bpmn/startEvents.js").BPMNStartEvent;
var BPMNEndEvent = require("../../../lib/bpmn/endEvents.js").BPMNEndEvent;
var BPMNSequenceFlow = require("../../../lib/bpmn/sequenceFlows.js").BPMNSequenceFlow;

exports.testCreatePersistentBPMNProcess = function(test) {
    var bpmnProcess;

    var persistencyPath = pathModule.join(__dirname, '../../resources/persistency/testPersistentProcess');
    fileUtilsModule.cleanDirectorySync(persistencyPath);

    var savedState = function(error, savedData) {
        test.ok(error === null, "testCreatePersistentBPMNProcess: no error saving.");

        var state = bpmnProcess.getState();
        test.deepEqual(state.tokens,
            [
                {
                    "position": "MyTask",
                    "substate": null,
                    "owningProcessId": "myid"
                }
            ],
            "testCreatePersistentBPMNProcess: reached first wait state."
        );

        test.deepEqual(savedData,
            {
                "processId": "myid",
                "data": {},
                "state": {
                    "tokens": [
                        {
                            "position": "MyTask",
                            "substate": null,
                            "owningProcessId": "myid"
                        }
                    ]
                },
                "history": {
                    "historyEntries": [
                        {
                            "name": "MyStart"
                        },
                        {
                            "name": "MyTask"
                        }
                    ]
                },
                "_id": 1
            },
            "testCreatePersistentBPMNProcess: saved data."
        );

        // this points to the process client interface and not to the process directly
        this._bpmnProcess.loadState();
    };

    var loadedState = function(error, loadedData) {
        test.ok(error === undefined || error === null, "testCreatePersistentBPMNProcess: no error loading.");

        var state = bpmnProcess.getState();
        test.deepEqual(state.tokens,
            [
                {
                    "position": "MyTask",
                    "substate": null,
                    "owningProcessId": "myid"
                }
            ],
            "testCreatePersistentBPMNProcess: reached save state."
        );

        test.deepEqual(loadedData,
            {
                "processId": "myid",
                "data": {},
                "state": {
                    "tokens": [
                        {
                            "position": "MyTask",
                            "substate": null,
                            "owningProcessId": "myid"
                        }
                    ]
                },
                "history": {
                    "historyEntries": [
                        {
                            "name": "MyStart"
                        },
                        {
                            "name": "MyTask"
                        }
                    ]
                },
                "_id": 1
            },
            "testCreatePersistentBPMNProcess: loaded data."
        );

        test.done();
    };

    var fileName = pathModule.join(__dirname, "../../resources/projects/simpleBPMN/taskExampleProcess.bpmn");
    bpmnProcess = bpmnProcessModule.createBPMNProcess("myid", fileName, persistencyPath, loadedState, savedState);

    // we let the process run to the first save state
    bpmnProcess.sendStartEvent("MyStart");
};
