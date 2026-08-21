import type {
  Key,
  ReactNode,
} from "react";


export interface Column<T> {
  key: string;
  header: string;

  render: (
    item: T
  ) => ReactNode;
}


interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];

  getRowKey: (
    item: T
  ) => Key;

  loading?: boolean;

  emptyMessage?: string;
}


function DataTable<T>({
  data,
  columns,
  getRowKey,
  loading = false,
  emptyMessage = "No existen registros.",
}: DataTableProps<T>) {

  if (loading) {
    return (
      <div className="empty-state">
        Cargando información...
      </div>
    );
  }


  if (data.length === 0) {
    return (
      <div className="empty-state">
        {emptyMessage}
      </div>
    );
  }


  return (
    <div className="table-wrapper">

      <table className="data-table">

        <thead>
          <tr>
            {columns.map(
              (column) => (
                <th key={column.key}>
                  {column.header}
                </th>
              )
            )}
          </tr>
        </thead>


        <tbody>

          {data.map(
            (item) => (

              <tr
                key={
                  getRowKey(item)
                }
              >

                {columns.map(
                  (column) => (

                    <td key={column.key}>
                      {
                        column.render(
                          item
                        )
                      }
                    </td>

                  )
                )}

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>
  );
}


export default DataTable;