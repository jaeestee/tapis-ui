import React, { useCallback } from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik, FieldArray, Field } from 'formik';
import { FormikInput, GenericModal, Icon, SectionMessage } from 'tapis-ui/_common';
import { focusManager } from 'react-query';
import { useCreate } from 'tapis-hooks/workflows/groupusers';
import styles from "./AddGroupUsersModal.module.scss"
import { Workflows } from "@tapis/tapis-typescript"
import * as Yup from 'yup';

type AddGroupUserModalProps = {
  toggle: () => void;
  groupId?: string
};

const AddGroupUsersModal: React.FC<AddGroupUserModalProps> = ({ toggle, groupId }) => {
  const { create, isLoading, error, isSuccess } = useCreate();
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const validationSchema = Yup.object({
    users: Yup.array()
      .of(
        Yup.object().shape({
          username: Yup.string().min(1).max(128).required("Username must be provided"),
          is_admin: Yup.bool().default(false)
        })
      )
      .min(1, "Must provide at least 1 user")
  });

  const initialValues = {
    users: [{username: "", is_admin: false}]
  };

  type AddGroupUserFormProps = {
    users: Array<Workflows.ReqGroupUser>
  }

  const onSubmit = ({ users }: AddGroupUserFormProps) => {
    create({groupId: groupId!, user: users[0]}, { onSuccess });
  }

  return (
    <GenericModal
      toggle={toggle}
      title={groupId ? `Add Users` : "Error: groupId is missing"}
      body={
        <div>
          {groupId ? (
            <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            render={({values}) => (
              <Form id="newgroup-form">
                <h2>Group: {groupId}</h2>
                <FieldArray
                  name="users"
                  render={(arrayHelpers) => (
                    <div>
                      <div className={styles["user-inputs"]}>
                        {values.users.length > 0 && (
                          values.users.map((user, index) => (
                            <div key={index} className={styles["user-input"]}>
                              <FormikInput
                                name={`users.${index}.username`}
                                label="Username"
                                required={true}
                                description={`TAPIS username`}
                                aria-label="Input"
                              />
                              <label>
                                <Field
                                  type="checkbox"
                                  name={`users.${index}.is_admin`}
                                  checked={user.is_admin}
                                /> is admin?
                              </label>
                              {index != 0 && (
                                <Button
                                  className={styles["remove-button"]}
                                  type="button"
                                  color="danger"
                                  onClick={() => arrayHelpers.remove(index)}
                                  size="sm"
                                >
                                  <Icon name="trash"/>
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      {/* TODO Support for adding multiple users
                      <Button
                        type="button"
                        className={styles["add-button"]}
                        onClick={() => arrayHelpers.push({username: "", is_admin: false})}>
                          +
                      </Button> */}
                    </div>
                  )}
                />
              
            </Form>
            )}
          >
          </Formik>
          ) : (
            <SectionMessage type="error">Error: No groupId found</SectionMessage>
          )}
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created group` : ''}
          reverse={true}
        >
          <Button
            form="newgroup-form"
            color="primary"
            disabled={isSuccess || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Add
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default AddGroupUsersModal;
